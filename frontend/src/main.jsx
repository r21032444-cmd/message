import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

console.log('main.jsx: Starting app...')
const root = document.getElementById('root')
console.log('main.jsx: root element:', root)

if (!root) {
  console.error('Root element not found!')
  document.body.innerHTML = '<h1>Root element not found!</h1>'
} else {
  console.log('main.jsx: Creating root')
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('main.jsx: App rendered')
}
