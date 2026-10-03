import { taskService } from '../tasks/taskService';
import { TaskPriority, TaskCategory } from '../types';

export const AI_TOOLS_DEFINITIONS = [
  {
    name: 'createTask',
    description: 'Create a new task with title, deadline, priority, and category',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the task' },
        description: { type: 'string', description: 'Optional description' },
        deadline: { type: 'string', description: 'ISO string or YYYY-MM-DDTHH:mm deadline' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
        category: { type: 'string', enum: ['STUDY', 'WORK', 'PERSONAL', 'PROJECT', 'HEALTH', 'OTHER'] }
      },
      required: ['title']
    }
  },
  {
    name: 'completeTask',
    description: 'Mark a task as completed by title or ID',
    parameters: {
      type: 'object',
      properties: {
        taskIdOrTitle: { type: 'string', description: 'The title or ID of the task to mark as completed' }
      },
      required: ['taskIdOrTitle']
    }
  },
  {
    name: 'getUpcomingTasks',
    description: 'Retrieve upcoming tasks due soon',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'getOverdueTasks',
    description: 'Retrieve overdue tasks',
    parameters: { type: 'object', properties: {} }
  }
];

export async function executeAiTool(toolName: string, args: any): Promise<any> {
  const allTasks = await taskService.getAllTasks();

  switch (toolName) {
    case 'createTask': {
      const created = await taskService.createTask(args.title, {
        description: args.description,
        deadline: args.deadline,
        priority: (args.priority as TaskPriority) || 'MEDIUM',
        category: (args.category as TaskCategory) || 'WORK'
      });
      return { success: true, task: created };
    }
    case 'completeTask': {
      const target = allTasks.find(
        t => t.id === args.taskIdOrTitle || t.title.toLowerCase().includes(String(args.taskIdOrTitle).toLowerCase())
      );
      if (!target) {
        return { success: false, error: `No task found matching "${args.taskIdOrTitle}"` };
      }
      const updated = await taskService.completeTask(target.id);
      return { success: true, completedTask: updated };
    }
    case 'getUpcomingTasks': {
      const upcoming = allTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'ARCHIVED');
      return { count: upcoming.length, tasks: upcoming };
    }
    case 'getOverdueTasks': {
      const now = new Date();
      const overdue = allTasks.filter(t => t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < now);
      return { count: overdue.length, tasks: overdue };
    }
    default:
      throw new Error(`Unknown tool ${toolName}`);
  }
}
