import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { StoreProvider } from './lib/store'
import { BodyPage } from './pages/BodyPage'
import { LibraryPage } from './pages/LibraryPage'
import { MorePage } from './pages/MorePage'
import { TemplateEditPage } from './pages/TemplateEditPage'
import { TimelinePage } from './pages/TimelinePage'
import { TodayPage } from './pages/TodayPage'
import { WorkoutEditPage } from './pages/WorkoutEditPage'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="min-h-dvh bg-surface-container">
          <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-surface shadow-[0_0_40px_rgba(0,0,0,0.06)]">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<TodayPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/workout/:id" element={<WorkoutEditPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/library/templates/new" element={<TemplateEditPage />} />
                <Route path="/library/templates/:id" element={<TemplateEditPage />} />
                <Route path="/body" element={<BodyPage />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <BottomNav />
          </div>
        </div>
      </BrowserRouter>
    </StoreProvider>
  )
}
