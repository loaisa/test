import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

console.log('Starting simple debug application...');
console.log('API URL:', process.env.REACT_APP_API_URL);

// Простой компонент без зависимостей для отладки
const DebugApp: React.FC = () => {
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#333' }}>Отладка React-приложения</h1>
      <p>Если вы видите эту страницу, значит базовый React работает корректно.</p>
      <p>Текущее время: {new Date().toLocaleString()}</p>
      <hr />
      <h2>Информация об окружении:</h2>
      <ul>
        <li><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'не задан'}</li>
        <li><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</li>
      </ul>
      
      <div style={{ marginTop: 20, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        <p>Для проверки API бэкенда:</p>
        <a 
          href={`${process.env.REACT_APP_API_URL}/posts`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#0066cc' }}
        >
          {process.env.REACT_APP_API_URL}/posts
        </a>
      </div>
    </div>
  );
};

// Получаем корневой элемент и рендерим приложение
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Корневой элемент #root не найден в документе');
  }
  
  console.log('Mounting debug application...');
  const root = createRoot(rootElement);
  root.render(<DebugApp />);
  console.log('Debug application mounted successfully!');
  
} catch (error) {
  console.error('Error in application initialization:', error);
  
  // Показываем ошибку на странице
  const errorMessage = error instanceof Error ? error.message : String(error);
  document.body.innerHTML = `
    <div style="color: red; padding: 20px; max-width: 800px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)">
      <h2>Ошибка при инициализации приложения:</h2>
      <pre>${errorMessage}</pre>
      <p>Проверьте консоль браузера (F12) для получения дополнительной информации.</p>
    </div>
  `;
}
