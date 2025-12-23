import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  subscribeTodoList,
  updateTodoList,
  addTodoItem,
  updateTodoItem,
  deleteTodoItem,
  duplicateTodoList,
} from '../lib/todoService';
import './TodoPage.css';

function TodoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todoList, setTodoList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('ui'); // 'ui' or 'text'
  const [newItemText, setNewItemText] = useState('');
  const [textContent, setTextContent] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const currentUrl = window.location.href;

  useEffect(() => {
    const unsubscribe = subscribeTodoList(id, (data) => {
      if (data) {
        setTodoList(data);
        setTextContent(data.items.map(item => item.text).join('\n'));
      } else {
        setTodoList(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    await addTodoItem(id, newItemText.trim());
    setNewItemText('');
  };

  const handleToggleItem = async (itemId, completed) => {
    await updateTodoItem(id, itemId, { completed: !completed });
  };

  const handleDeleteItem = async (itemId) => {
    await deleteTodoItem(id, itemId);
  };

  const handleUpdateTitle = async (newTitle) => {
    if (newTitle.trim()) {
      await updateTodoList(id, { title: newTitle.trim() });
    }
  };

  const handleTextModeUpdate = async () => {
    const lines = textContent.split('\n').filter(line => line.trim());
    const newItems = lines.map((line, index) => {
      const existingItem = todoList.items[index];
      return existingItem || {
        id: Math.random().toString(36).substring(2, 15),
        text: line.trim(),
        completed: false,
        createdAt: Date.now(),
      };
    });

    // Update existing items' text
    const updatedItems = newItems.map((newItem, index) => {
      const line = lines[index];
      if (todoList.items[index]) {
        return { ...todoList.items[index], text: line.trim() };
      }
      return newItem;
    });

    await updateTodoList(id, { items: updatedItems });
    setMode('ui');
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const newId = await duplicateTodoList(id);
      if (newId) {
        navigate(`/todo/${newId}`);
      }
    } catch (error) {
      console.error('複製エラー:', error);
      alert('複製に失敗しました');
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <div className="todo-page loading">
        <div className="spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!todoList) {
    return (
      <div className="todo-page error">
        <h2>TODOリストが見つかりません</h2>
        <button onClick={() => navigate('/')} className="back-button">
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="todo-page">
      <div className="todo-container">
        <header className="todo-header">
          <input
            type="text"
            value={todoList.title}
            onChange={(e) => handleUpdateTitle(e.target.value)}
            className="title-editable"
          />
          <div className="header-actions">
            <button
              onClick={() => setMode(mode === 'ui' ? 'text' : 'ui')}
              className="mode-toggle"
            >
              {mode === 'ui' ? '📝 テキストモード' : '✅ UIモード'}
            </button>
            <button onClick={() => setShowQR(!showQR)} className="qr-button">
              {showQR ? '📋 QR非表示' : '📱 QR表示'}
            </button>
            <button onClick={handleDuplicate} disabled={duplicating} className="duplicate-button">
              {duplicating ? '複製中...' : '📋 複製'}
            </button>
          </div>
        </header>

        {showQR && (
          <div className="qr-section">
            <QRCodeSVG value={currentUrl} size={200} level="H" />
            <p className="url-text">{currentUrl}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentUrl);
                alert('URLをコピーしました！');
              }}
              className="copy-button"
            >
              URLをコピー
            </button>
          </div>
        )}

        {mode === 'ui' ? (
          <div className="ui-mode">
            <form onSubmit={handleAddItem} className="add-item-form">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="新しいTODOを入力"
                className="add-item-input"
              />
              <button type="submit" className="add-button">追加</button>
            </form>

            <ul className="todo-list">
              {todoList.items.map((item) => (
                <li key={item.id} className="todo-item">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item.id, item.completed)}
                    className="todo-checkbox"
                  />
                  <span className={item.completed ? 'completed' : ''}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="delete-button"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            {todoList.items.length === 0 && (
              <p className="empty-message">TODOアイテムがありません</p>
            )}
          </div>
        ) : (
          <div className="text-mode">
            <p className="text-mode-hint">1行に1つのTODOを入力してください</p>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="text-editor"
              rows={15}
              placeholder="TODO 1&#10;TODO 2&#10;TODO 3"
            />
            <div className="text-mode-actions">
              <button onClick={handleTextModeUpdate} className="save-button">
                保存してUIモードへ
              </button>
              <button onClick={() => {
                setTextContent(todoList.items.map(item => item.text).join('\n'));
                setMode('ui');
              }} className="cancel-button">
                キャンセル
              </button>
            </div>
          </div>
        )}

        <footer className="todo-footer">
          <p>完了: {todoList.items.filter(item => item.completed).length} / {todoList.items.length}</p>
          <button onClick={() => navigate('/')} className="home-link">
            新しいTODOリストを作成
          </button>
        </footer>
      </div>
    </div>
  );
}

export default TodoPage;
