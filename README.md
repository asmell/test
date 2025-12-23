# 共有TODO Webアプリ

複数人で共有できるリアルタイムTODO管理アプリケーション

## 主な機能

- ✅ **2つのモード**: UIモード（チェックボックス形式）とテキスト編集モード（行単位）を切り替え可能
- 🔗 **簡単共有**: タイトルだけでインスタント作成、URLとQRコードで即座に共有
- ⚡ **リアルタイム同期**: Firestoreによる複数人でのリアルタイム編集
- 📋 **複製機能**: 既存のTODOリストを簡単に複製
- 📱 **レスポンシブデザイン**: モバイルからデスクトップまで対応

## 技術スタック

- **フロントエンド**: React + Vite
- **ルーティング**: React Router v7
- **データベース**: Firebase Firestore
- **QRコード**: qrcode.react
- **スタイリング**: CSS Modules

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestoreデータベースを有効化（テストモードで開始）
3. プロジェクト設定から設定値を取得
4. `.env.example`を`.env`にコピーして設定値を入力

```bash
cp .env.example .env
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてアプリケーションにアクセス

### 4. ビルド

```bash
npm run build
```

## 使い方

### TODOリストの作成

1. ホーム画面でTODOリストのタイトルを入力
2. 「TODOリストを作成」ボタンをクリック
3. 自動的に新しいTODOリストページに移動

### TODOアイテムの管理

**UIモード:**
- 新しいTODOを入力欄に入力して追加
- チェックボックスをクリックして完了/未完了を切り替え
- ×ボタンでアイテムを削除

**テキストモード:**
- 「📝 テキストモード」ボタンをクリック
- 1行に1つのTODOを入力
- 「保存してUIモードへ」で保存

### 共有方法

1. 「📱 QR表示」ボタンをクリック
2. QRコードをスキャンまたはURLをコピーして共有
3. 共有されたユーザーはリアルタイムで編集を確認可能

### 複製

「📋 複製」ボタンをクリックすると、現在のTODOリストが新しいIDで複製されます

## Firestore セキュリティルール

本番環境では、以下のようなセキュリティルールを設定することを推奨します：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read: true;
      allow create: true;
      allow update: true;
      allow delete: false; // 削除は無効化
    }
  }
}
```

## ライセンス

MIT
