import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const SimpleApp = () => {
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#333' }}>Тестовое приложение</h1>
      <p>Если вы видите эту страницу, значит базовый React работает корректно.</p>
      <p>Текущее время: {new Date().toLocaleString()}</p>
      <p>Переменные окружения:</p>
      <pre style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: 4 }}>
        REACT_APP_API_URL: {process.env.REACT_APP_API_URL || 'не задан'}
      </pre>
      <div style={{ marginTop: 20 }}>
        <p>Чтобы проверить работу API, можете открыть в браузере:</p>
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

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    console.log('Initializing simple app...');
    const root = createRoot(rootElement);
    root.render(<SimpleApp />);
    console.log('Simple app rendered successfully');
  } catch (error) {
    console.error('Failed to render simple app:', error);
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px; max-width: 800px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)">
        <h2>Ошибка при рендеринге приложения:</h2>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
        <p>Проверьте консоль браузера для получения дополнительной информации.</p>
      </div>
    `;
  }
} else {
  console.error('Root element (#root) not found in the document');
  document.body.innerHTML = `
    <div style="color: red; padding: 20px; max-width: 800px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)">
      <h2>Ошибка при инициализации:</h2>
      <p>Элемент с id="root" не найден в документе.</p>
      <p>Проверьте содержимое файла public/index.html.</p>
    </div>
  `;
} 