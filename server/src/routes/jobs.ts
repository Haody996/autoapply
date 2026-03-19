import { Router, Response } from 'express'
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth'
import { computeMatchScore } from '../lib/keyword-match'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/jobs — serves from DB only; enriches with match score + application status if logged in
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const q = String(req.query.q || '').toLowerCase()
  const location = req.query.location ? String(req.query.location).toLowerCase() : undefined
  const jobType = req.query.jobType ? String(req.query.jobType) : undefined
  const remote = req.query.remote
  const page = Math.max(1, parseInt(String(req.query.page || '1')))
  const minScore = req.query.minScore ? parseInt(String(req.query.minScore)) : undefined
  const PAGE_SIZE = 20

  try {
    const where: any = {}

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }
    if (jobType) {
      where.jobType = { equals: jobType.toUpperCase(), mode: 'insensitive' }
    }
    if (remote === 'true') {
      where.isRemote = true
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: { fetchedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ])

    // Enrich with match score + application status if logged in
    let resumeText = ''
    let appliedMap = new Map<string, any>()

    if (req.userId) {
      const [profile, applications] = await Promise.all([
        prisma.profile.findUnique({ where: { userId: req.userId }, select: { resumeText: true } }),
        prisma.application.findMany({
          where: { userId: req.userId, jobId: { in: jobs.map((j) => j.id) } },
          select: { jobId: true, status: true, id: true },
        }),
      ])
      resumeText = profile?.resumeText || ''
      appliedMap = new Map(applications.map((a) => [a.jobId, a]))
    }

    let enriched = jobs.map((job) => {
      const matchScore = resumeText ? computeMatchScore(job.description, resumeText) : null
      const application = appliedMap.get(job.id) || null
      return { ...job, matchScore, application }
    })

    if (minScore && resumeText) {
      enriched = enriched.filter((j) => (j.matchScore || 0) >= minScore)
    }

    res.json({ jobs: enriched, total, page })
  } catch (err: any) {
    console.error('Jobs fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch jobs', detail: err.message })
  }
})

// GET /api/jobs/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const jobId = req.params.id as string
  const job = await prisma.job.findUnique({ where: { id: jobId } })

  if (!job) {
    res.status(404).json({ error: 'Job not found' })
    return
  }

  let matchScore = null
  let application = null

  if (req.userId) {
    const [profile, app] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: req.userId }, select: { resumeText: true } }),
      prisma.application.findFirst({
        where: { jobId, userId: req.userId },
        select: { id: true, status: true, appliedAt: true, matchScore: true },
      }),
    ])
    matchScore = profile?.resumeText ? computeMatchScore(job.description, profile.resumeText) : null
    application = app
  }

  res.json({ ...job, matchScore, application })
})

export default router
