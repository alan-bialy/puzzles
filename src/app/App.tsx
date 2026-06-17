
import './App.css'

import { Route, Routes } from 'react-router'
import { AppLayout } from  './AppLayout'
import { HomePage } from '../pages/HomePage'
import { WordlePage } from '../pages/WordlePage'
import { NotFoundPage } from  '../pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="wordle" element={<WordlePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}