import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTodoList } from './lib/todoService';
import './App.css';

function App() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const id = await createTodoList(title.trim());
      navigate(`/todo/${id}`);
    } catch (error) {
      console.error('TODOリスト作成エラー:', error);
      alert('TODOリストの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <h1>共有TODO</h1>
        <p className="description">
          複数人で共有できるTODOリストを作成しましょう
        </p>

        <form onSubmit={handleCreate} className="create-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="TODOリストのタイトルを入力"
            className="title-input"
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !title.trim()} className="create-button">
            {loading ? '作成中...' : 'TODOリストを作成'}
          </button>
        </form>

        <div className="features">
          <div className="feature">
            <h3>📝 2つのモード</h3>
            <p>UIモードとテキスト編集モードを切り替え可能</p>
          </div>
          <div className="feature">
            <h3>🔗 簡単共有</h3>
            <p>URLとQRコードで即座に共有</p>
          </div>
          <div className="feature">
            <h3>⚡ リアルタイム同期</h3>
            <p>複数人での編集をリアルタイムに反映</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
