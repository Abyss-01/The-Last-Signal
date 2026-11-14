import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ArchiveLandingPage } from '@/pages/archive/ArchiveLandingPage'
import { Apollo11ExpeditionPage } from '@/pages/expeditions/Apollo11ExpeditionPage'
import { ArtifactInspectionPage } from '@/pages/expeditions/ArtifactInspectionPage'
import { ExpeditionSelectionPage } from '@/pages/expeditions/ExpeditionSelectionPage'
import { ROUTES } from './routes'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <ArchiveLandingPage /> },
      { path: ROUTES.expeditions, element: <ExpeditionSelectionPage /> },
      { path: ROUTES.apollo11, element: <Apollo11ExpeditionPage /> },
      { path: ROUTES.artifactPattern, element: <ArtifactInspectionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
