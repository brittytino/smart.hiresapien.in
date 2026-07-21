import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import Institution from '@/models/Institution';
import { signStudentToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { username, password, fullName, batch, studentId } = body;

    if (!username || !password || !fullName) {
      return NextResponse.json({ error: 'Username, password, and full name are required' }, { status: 400 });
    }

    const trimmedUsername = username.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await UserAccount.findOne({ username: trimmedUsername });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Get or create a default institution
    let institution = await Institution.findOne({ code: 'DEFAULT' });
    if (!institution) {
      // Find any existing institution first
      institution = await Institution.findOne();
      if (!institution) {
        // Create a default institution
        const dummyAdminId = new mongoose.Types.ObjectId();
        const instId = new mongoose.Types.ObjectId();
        
        // Create dummy admin first so we don't violate ref/required fields
        await UserAccount.create({
          _id: dummyAdminId,
          username: 'default_admin_account',
          password: await bcrypt.hash('default_admin_secure_123', 12),
          role: 'institution_admin',
          institutionId: instId,
          createdBy: 'system',
          isActive: true,
          fullName: 'Default Admin',
        });

        institution = await Institution.create({
          _id: instId,
          name: 'Default Institution',
          code: 'DEFAULT',
          institutionAdminId: dummyAdminId,
          facultySlotLimit: 1000,
          studentSlotLimit: 1000,
          createdByAdmin: 'system',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newStudent = await UserAccount.create({
      username: trimmedUsername,
      password: hashedPassword,
      role: 'student',
      institutionId: institution._id,
      fullName: fullName.trim(),
      batch: batch ? batch.trim() : 'General',
      studentId: studentId ? studentId.trim().toUpperCase() : undefined,
      createdBy: 'self-signup',
      isActive: true,
    });

    const token = signStudentToken(
      newStudent._id.toString(),
      newStudent.username,
      institution._id.toString()
    );

    return NextResponse.json({
      token,
      role: 'student',
      redirect: '/student',
      user: newStudent.toJSON(),
    }, { status: 201 });

  } catch (error: any) {
    console.error('[POST /api/auth/signup] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
