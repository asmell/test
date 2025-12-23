import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const TODOS_COLLECTION = 'todos';

// ユニークIDを生成
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

// 新しいTODOリストを作成
export const createTodoList = async (title) => {
  const id = generateId();
  const todoRef = doc(db, TODOS_COLLECTION, id);

  await setDoc(todoRef, {
    id,
    title,
    items: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return id;
};

// TODOリストを取得
export const getTodoList = async (id) => {
  const todoRef = doc(db, TODOS_COLLECTION, id);
  const todoSnap = await getDoc(todoRef);

  if (todoSnap.exists()) {
    return todoSnap.data();
  }
  return null;
};

// TODOリストを更新
export const updateTodoList = async (id, updates) => {
  const todoRef = doc(db, TODOS_COLLECTION, id);
  await updateDoc(todoRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// TODOアイテムを追加
export const addTodoItem = async (listId, text) => {
  const list = await getTodoList(listId);
  if (!list) return;

  const newItem = {
    id: generateId(),
    text,
    completed: false,
    createdAt: Date.now(),
  };

  await updateTodoList(listId, {
    items: [...list.items, newItem],
  });
};

// TODOアイテムを更新
export const updateTodoItem = async (listId, itemId, updates) => {
  const list = await getTodoList(listId);
  if (!list) return;

  const updatedItems = list.items.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  );

  await updateTodoList(listId, { items: updatedItems });
};

// TODOアイテムを削除
export const deleteTodoItem = async (listId, itemId) => {
  const list = await getTodoList(listId);
  if (!list) return;

  const updatedItems = list.items.filter(item => item.id !== itemId);
  await updateTodoList(listId, { items: updatedItems });
};

// TODOリストを複製
export const duplicateTodoList = async (sourceId) => {
  const sourceList = await getTodoList(sourceId);
  if (!sourceList) return null;

  const newId = generateId();
  const todoRef = doc(db, TODOS_COLLECTION, newId);

  await setDoc(todoRef, {
    id: newId,
    title: `${sourceList.title} (コピー)`,
    items: sourceList.items.map(item => ({
      ...item,
      id: generateId(),
      completed: false,
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newId;
};

// リアルタイムリスナーをセットアップ
export const subscribeTodoList = (id, callback) => {
  const todoRef = doc(db, TODOS_COLLECTION, id);
  return onSnapshot(todoRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  });
};
