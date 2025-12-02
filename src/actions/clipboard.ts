'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface ClipboardNote {
  id: string;
  content: string;
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetNotesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'order';
  sortOrder?: 'asc' | 'desc';
}

export interface GetNotesResult {
  notes: ClipboardNote[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Helper function to parse tags
function parseTags(tagsString: string | null): string[] {
  if (!tagsString) return [];
  return tagsString.split(',').filter(tag => tag.trim());
}

// Helper function to serialize tags
function serializeTags(tags: string[]): string {
  return tags.slice(0, 3).join(','); // Max 3 tags
}

// Get all notes with pagination and filtering
export async function getNotes(params: GetNotesParams = {}): Promise<GetNotesResult> {
  const {
    page = 1,
    pageSize = 12,
    search = '',
    tags = [],
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  try {
    const userId = 'default-admin';
    
    // Build where clause
    const where: any = { userId };
    
    // Search filter
    if (search) {
      where.content = {
        contains: search,
      };
    }
    
    // Tags filter
    if (tags.length > 0) {
      where.AND = tags.map(tag => ({
        tags: {
          contains: tag,
        },
      }));
    }

    // Get total count
    const total = await db.clipboardNote.count({ where });

    // Get paginated notes
    const notes = await db.clipboardNote.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      notes: notes.map(note => ({
        id: note.id,
        content: note.content,
        tags: parseTags(note.tags),
        order: note.order,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Error getting notes:', error);
    throw new Error('Failed to get notes');
  }
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  try {
    const userId = 'default-admin';
    
    const notes = await db.clipboardNote.findMany({
      where: { userId },
      select: { tags: true },
    });

    const allTags = new Set<string>();
    notes.forEach(note => {
      parseTags(note.tags).forEach(tag => allTags.add(tag));
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error('Error getting all tags:', error);
    return [];
  }
}

// Create a new note
export async function createNote(content: string, tags: string[]): Promise<ClipboardNote> {
  try {
    const userId = 'default-admin';
    
    // Validate tags (max 3)
    if (tags.length > 3) {
      throw new Error('Maximum 3 tags allowed');
    }

    const note = await db.clipboardNote.create({
      data: {
        userId,
        content,
        tags: serializeTags(tags),
        order: 0,
      },
    });

    revalidatePath('/admin/tools/clipboard-notes');

    return {
      id: note.id,
      content: note.content,
      tags: parseTags(note.tags),
      order: note.order,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  } catch (error) {
    console.error('Error creating note:', error);
    throw new Error('Failed to create note');
  }
}

// Update a note
export async function updateNote(
  id: string,
  data: { content?: string; tags?: string[]; order?: number }
): Promise<ClipboardNote> {
  try {
    const userId = 'default-admin';
    
    // Validate tags if provided
    if (data.tags && data.tags.length > 3) {
      throw new Error('Maximum 3 tags allowed');
    }

    const updateData: any = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) updateData.tags = serializeTags(data.tags);
    if (data.order !== undefined) updateData.order = data.order;

    const note = await db.clipboardNote.update({
      where: { id, userId },
      data: updateData,
    });

    revalidatePath('/admin/tools/clipboard-notes');

    return {
      id: note.id,
      content: note.content,
      tags: parseTags(note.tags),
      order: note.order,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('Failed to update note');
  }
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
  try {
    const userId = 'default-admin';
    
    await db.clipboardNote.delete({
      where: { id, userId },
    });

    revalidatePath('/admin/tools/clipboard-notes');
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
}

// Bulk delete notes
export async function deleteNotes(ids: string[]): Promise<void> {
  try {
    const userId = 'default-admin';
    
    await db.clipboardNote.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    revalidatePath('/admin/tools/clipboard-notes');
  } catch (error) {
    console.error('Error deleting notes:', error);
    throw new Error('Failed to delete notes');
  }
}
