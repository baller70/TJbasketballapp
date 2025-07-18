
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const drillId = searchParams.get('drillId');
    const drillCompletionId = searchParams.get('drillCompletionId');
    const mediaType = searchParams.get('mediaType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    
    // If requestedUserId is provided, filter by that user
    if (requestedUserId) {
      where.userId = requestedUserId;
    }
    
    // If drillId is provided, filter by that drill
    if (drillId) {
      where.drillId = drillId;
    }
    
    // If drillCompletionId is provided, filter by that completion
    if (drillCompletionId) {
      where.drillCompletionId = drillCompletionId;
    }
    
    // If mediaType is provided, filter by that type
    if (mediaType && ['VIDEO', 'IMAGE'].includes(mediaType)) {
      where.mediaType = mediaType;
    }

    // Get current user to determine access permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        parentId: true,
        children: {
          select: { id: true }
        }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Apply access control
    if (currentUser.role === 'PLAYER') {
      // Players can only see their own uploads
      where.userId = currentUser.id;
    } else if (currentUser.role === 'PARENT') {
      // Parents can see uploads from their children
      const childIds = currentUser.children.map(child => child.id);
      if (childIds.length > 0) {
        where.userId = {
          in: childIds
        };
      } else {
        // Parent with no children - return empty result
        return NextResponse.json({ mediaUploads: [], total: 0 });
      }
    }

    const [mediaUploads, total] = await Promise.all([
      prisma.mediaUpload.findMany({
        where,
        include: {
          drill: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          drillCompletion: {
            select: {
              id: true,
              rating: true,
              completedAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.mediaUpload.count({ where })
    ]);

    return NextResponse.json({
      mediaUploads,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching media uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media uploads' },
      { status: 500 }
    );
  }
}
