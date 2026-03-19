import 'dotenv/config'
import { Worker } from 'bullmq'
import { connection } from '../lib/queue'
import { searchJobs, formatSalary } from '../lib/jsearch'
import prisma from '../lib/prisma'

const JOBS_PER_PREFERENCE = 10

const worker = new Worker(
  'job-refresh',
  async () => {
    console.log('[job-refresh] Starting weekly job refresh...')

    // Collect all unique keyword+location pairs from user preferences
    const prefs = await prisma.jobPreference.findMany({
      where: { keywords: { not: '' } },
      select: { keywords: true, location: true },
    })

    // Deduplicate preference combinations
    const seen = new Set<string>()
    const uniquePrefs = prefs.filter((p) => {
      const key = `${p.keywords.toLowerCase()}|${p.location.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    if (uniquePrefs.length === 0) {
      console.log('[job-refresh] No user preferences set — skipping')
      return
    }

    let totalUpserted = 0

    for (const pref of uniquePrefs) {
      try {
        const query = pref.location
          ? `${pref.keywords} in ${pref.location}`
          : pref.keywords

        const rawJobs = await searchJobs({
          q: query,
          num_pages: 1,
          date_posted: 'week',
        })

        const slice = rawJobs.slice(0, JOBS_PER_PREFERENCE)

        await Promise.all(
          slice.map((j) =>
            prisma.job.upsert({
              where: { externalId: j.job_id },
              update: { fetchedAt: new Date() },
              create: {
                externalId: j.job_id,
                title: j.job_title,
                company: j.employer_name,
                location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', '),
                description: j.job_description || '',
                url: j.job_apply_link,
                source: j.job_source || 'JSearch',
                salary: formatSalary(j),
                jobType: j.job_employment_type,
                isRemote: j.job_is_remote,
                postedAt: j.job_posted_at_datetime_utc
                  ? new Date(j.job_posted_at_datetime_utc)
                  : null,
              },
            })
          )
        )

        totalUpserted += slice.length
        console.log(`[job-refresh] "${query}" — ${slice.length} jobs upserted`)
      } catch (err) {
        console.error(`[job-refresh] Failed for "${pref.keywords}":`, err)
      }
    }

    console.log(`[job-refresh] Done — ${totalUpserted} total jobs upserted`)
  },
  { connection, concurrency: 1 }
)

worker.on('failed', (job, err) => {
  console.error('[job-refresh] Job failed:', err)
})

worker.on('error', (err) => {
  console.error('[job-refresh] Worker error:', err)
})

export default worker
