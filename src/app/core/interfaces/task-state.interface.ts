import { Task } from './task.interface';

/**
 * Interfaz común para servicios que manejan tareas
 * Permite unificar la lógica de formularios de tareas
 */
export interface TaskStateInterface {
  addTask(task: Task): void;
}
