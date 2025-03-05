import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';
import { Role } from '@utils/types';

// Function to validate Sistema domain emails
function isSystemaDomain(email: string): boolean {
  // Update with actual Sistema domains
  return email.endsWith('@sistema.com') || email.endsWith('@sistematoronto.ca');
}

// GET: Retrieve all users or a specific user by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      // Get specific user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(user);
    }

    // Get all users
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add a user to the database after Google OAuth authentication
export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, authId, profilePicture } =
      await request.json();

    // Validate required fields
    if (!email || !authId) {
      return NextResponse.json(
        { error: 'Email and authId are required' },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!isSystemaDomain(email)) {
      return NextResponse.json(
        { error: 'Only Sistema domain emails are allowed' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Return existing user
      return NextResponse.json(existingUser);
    }

    // Create new user with default TEACHER role
    const newUser = await prisma.user.create({
      data: {
        authId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: Role.TEACHER, // Default role
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing user
export async function PUT(request: NextRequest) {
  try {
    const { id, email, firstName, lastName, role, profilePicture } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If email is changing, validate domain
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (
        existingUser &&
        email !== existingUser.email &&
        !isSystemaDomain(email)
      ) {
        return NextResponse.json(
          { error: 'Only Sistema domain emails are allowed' },
          { status: 403 }
        );
      }
    }

    // Update user
    const updatedData: any = {};
    if (email) updatedData.email = email;
    if (firstName) updatedData.firstName = firstName;
    if (lastName) updatedData.lastName = lastName;
    if (role) updatedData.role = role;
    if (profilePicture !== undefined)
      updatedData.profilePicture = profilePicture;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
