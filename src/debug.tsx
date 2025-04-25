import React from 'react';
import { createRoot } from 'react-dom/client';

const SimpleDebugApp: React.FC = () => {
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
      <h1>Отладочная страница React</h1>
      <p>Если вы видите эту страницу, значит базовый React работает.</p>
      <p>Проблема может быть в Redux, React Router или других компонентах.</p>
      <hr />
      <div>
        <h2>Информация об окружении:</h2>
        <ul>
          <li>API URL: {process.env.REACT_APP_API_URL || 'Не задан'}</li>
          <li>Режим: {process.env.NODE_ENV}</li>
          <li>Время загрузки: {new Date().toLocaleString()}</li>
        </ul>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    console.log('Mounting debug app...');
    const root = createRoot(rootElement);
    root.render(<SimpleDebugApp />);
    console.log('Debug app mounted successfully');
  } catch (err) {
    console.error('Error rendering debug app:', err);
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px;">
        <h2>Ошибка рендеринга отладочного приложения:</h2>
        <pre>${err instanceof Error ? err.message : String(err)}</pre>
      </div>
    `;
  }
} else {
  console.error('Root element not found for debug app');
  document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h2>Ошибка:</h2>
      <p>Не найден элемент с id="root"</p>
    </div>
  `;
}

export default SimpleDebugApp; 