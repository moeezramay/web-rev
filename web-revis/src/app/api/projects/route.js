import { cookies } from 'next/headers';
import clientPromise from '../../../lib/db';
import { verifyJWT } from '../../../lib/jwt';
import { ObjectId } from 'mongodb';

export async function GET() { //to get the project list
  try {
    const cookieStore = await cookies();            
    const jwt = cookieStore.get('jwt')?.value;
    if (!jwt) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    const { sub } = await verifyJWT(jwt); 
    const ownerId = new ObjectId(sub);

    const client = await clientPromise;
    const db = client.db('sprintboard');
    const projectsCol = db.collection('projects');

    // helpful indexes (no-op if already created)
    await projectsCol.createIndex({ ownerId: 1, createdAt: -1 });

    const projects = await projectsCol
      .find({ ownerId })
      .project({ name: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ ok: true, projects });
  } catch (e) {
    console.error(e);
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) { //to upload a new project
  try {
    const cookieStore = await cookies();            
    const jwt = cookieStore.get('jwt')?.value;
    if (!jwt) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    const { sub } = await verifyJWT(jwt);
    const ownerId = new ObjectId(sub);

    const { name } = await req.json();
    const clean = (name || '').trim();
    if (!clean) return Response.json({ message: 'Project name required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('sprintboard');
    const projectsCol = db.collection('projects');

    const now = new Date();
    const doc = { name: clean, ownerId, createdAt: now };
    const { insertedId } = await projectsCol.insertOne(doc);

    return Response.json({ ok: true, project: { _id: insertedId, ...doc } }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
