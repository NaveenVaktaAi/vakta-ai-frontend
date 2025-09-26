#!/usr/bin/env node
/**
 * Chat Connection Test Script
 * Tests the connection between frontend and backend
 */

const WebSocket = require('ws');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BACKEND_URL = 'http://127.0.0.1:5000';
const WS_URL = 'ws://127.0.0.1:5000/api/v1/chat/ws';

async function testBackendHealth() {
  console.log('🔍 Testing Backend Health...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('  ✅ Backend is healthy:', data);
      return true;
    } else {
      console.log('  ❌ Backend health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('  ❌ Backend is not running:', error.message);
    return false;
  }
}

async function testChatAPI() {
  console.log('🔍 Testing Chat API...');
  
  try {
    // Test creating a chat
    const createResponse = await fetch(`${BACKEND_URL}/api/v1/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 1,
        title: 'Test Chat',
        status: 'active'
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`HTTP ${createResponse.status}: ${await createResponse.text()}`);
    }
    
    const chatData = await createResponse.json();
    console.log('  ✅ Chat created successfully:', chatData);
    
    if (chatData.success && chatData.chat_id) {
      return chatData.chat_id;
    } else {
      throw new Error('Failed to create chat');
    }
  } catch (error) {
    console.log('  ❌ Chat API test failed:', error.message);
    return null;
  }
}

function testWebSocketConnection(chatId) {
  return new Promise((resolve) => {
    console.log('🔍 Testing WebSocket Connection...');
    
    const ws = new WebSocket(`${WS_URL}/${chatId}`);
    let connected = false;
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!connected) {
        console.log('  ❌ WebSocket connection timeout');
        ws.close();
        resolve(false);
      }
    }, 5000);
    
    ws.on('open', () => {
      console.log('  ✅ WebSocket connected');
      connected = true;
      
      // Send a test message
      ws.send(JSON.stringify({
        mt: 'message_upload',
        message: 'Hello, this is a test message',
        content: 'Hello, this is a test message',
        timestamp: new Date().toISOString(),
        userId: '1',
        timezone: 'UTC',
        selectedLanguage: 'en'
      }));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('  ✅ Message received:', message);
        messageReceived = true;
        
        setTimeout(() => {
          ws.close();
          clearTimeout(timeout);
          resolve(true);
        }, 1000);
      } catch (error) {
        console.log('  ❌ Error parsing message:', error.message);
        ws.close();
        clearTimeout(timeout);
        resolve(false);
      }
    });
    
    ws.on('error', (error) => {
      console.log('  ❌ WebSocket error:', error.message);
      clearTimeout(timeout);
      resolve(false);
    });
    
    ws.on('close', (code) => {
      console.log(`  ℹ️  WebSocket closed with code: ${code}`);
      if (!messageReceived && connected) {
        console.log('  ⚠️  WebSocket closed without receiving message');
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });
}

async function main() {
  console.log('🚀 Chat Connection Test');
  console.log('=' * 50);
  
  // Test 1: Backend Health
  const isHealthy = await testBackendHealth();
  if (!isHealthy) {
    console.log('\n❌ Backend is not running. Please start the backend first:');
    console.log('   cd VaktaAi');
    console.log('   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000');
    process.exit(1);
  }
  
  // Test 2: Chat API
  const chatId = await testChatAPI();
  if (!chatId) {
    console.log('\n❌ Chat API is not working properly');
    process.exit(1);
  }
  
  // Test 3: WebSocket Connection
  const wsWorking = await testWebSocketConnection(chatId);
  
  // Summary
  console.log('\n' + '=' * 50);
  console.log('📊 TEST SUMMARY');
  console.log('=' * 50);
  console.log(`Backend Health: ${isHealthy ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Chat API: ${chatId ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`WebSocket: ${wsWorking ? '✅ PASS' : '❌ FAIL'}`);
  
  if (isHealthy && chatId && wsWorking) {
    console.log('\n🎉 All tests passed! Frontend can connect to backend.');
    console.log('\n🚀 To start the frontend:');
    console.log('   cd frontend');
    console.log('   npm run dev');
  } else {
    console.log('\n❌ Some tests failed. Please check the backend configuration.');
  }
}

main().catch(console.error);

