import { MongoClient, Db } from 'mongodb';

// Code writes support from chatGPT-3.5

// MongoDB 연결 문자열 (MongoDB URI)
const uri = `mongodb+srv://ashual:${process.env.DBPASS}@cluster0.qo3ekyu.mongodb.net/`; // 본인의 MongoDB URI로 변경

// MongoDB 클라이언트 생성
const client = new MongoClient(uri);

// 데이터베이스 연결 함수 (async/await 사용)
async function connectToMongoDB(): Promise<void> {
  try {
    // MongoDB 연결
    await client.connect();

    console.log('Connected to Mongodb.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// 데이터베이스 객체 반환 함수
function getMongoDB(): Db {
  return client.db('multiris');
}

export { connectToMongoDB, getMongoDB };
