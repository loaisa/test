import React from 'react';
import { createRoot } from 'react-dom/client';

function SimpleApp() {
  return (
    <div style={{ 
      padding: 20, 
      maxWidth: 800, 
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginTop: 50
    }}>
      <h1>Тестовое React-приложение</h1>
      <p>Если вы видите эту страницу, значит React запустился корректно.</p>
      <p>Текущее время: {new Date().toLocaleString()}</p>
      <p>API URL: {process.env.REACT_APP_API_URL || 'Не задан'}</p>
    </div>
  );
}

// Рендерим компонент напрямую в DOM, минуя Redux и другие библиотеки
try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<SimpleApp />);
  } else {
    console.error('Root element not found');
  }
} catch (err) {
  console.error('Error rendering app:', err);
  // Показываем ошибку на странице
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px;">
        <h2>Ошибка рендеринга:</h2>
        <pre>${err instanceof Error ? err.message : String(err)}</pre>
      </div>
    `;
  }
}

export default SimpleApp; 