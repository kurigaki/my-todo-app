"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, GripVertical, Plus, MessageCircle, Send } from "lucide-react";

interface Comment {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  comments: Comment[];
}

interface DbComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  users: { name: string } | { name: string }[] | null;
}

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAddComment: (taskId: string, content: string) => void;
  isDragging?: boolean;
}

function TaskCard({ task, onDelete, onToggle, onAddComment, isDragging }: TaskCardProps) {
  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddComment = () => {
    const trimmedContent = commentInput.trim();
    if (!trimmedContent) return;
    onAddComment(task.id, trimmedContent);
    setCommentInput("");
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group bg-card border rounded-lg shadow-sm
        hover:shadow-md transition-all duration-200
        ${isDragging ? "opacity-50" : ""}
        ${task.completed ? "bg-muted/50" : ""}
      `}
    >
      {/* Task Header */}
      <div className="flex items-start gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <p
          className={`flex-1 text-sm leading-relaxed ${
            task.completed ? "text-muted-foreground line-through" : ""
          }`}
        >
          {task.text}
        </p>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary relative"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            {task.comments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {task.comments.length}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onToggle(task.id)}
          >
            {task.completed ? (
              <span className="text-xs">↩</span>
            ) : (
              <span className="text-xs">✓</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(task.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t bg-muted/30 rounded-b-lg">
          {/* Comments List */}
          <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
            {task.comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                コメントはありません
              </p>
            ) : (
              task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-background/80 rounded-md p-2 text-xs"
                >
                  <span className="font-medium text-foreground">
                    {comment.author_name}
                  </span>
                  <p className="text-muted-foreground mt-1">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="p-3 pt-0">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="コメントを入力..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                className="flex-1 h-8 text-xs"
              />
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={handleAddComment}
                disabled={!commentInput.trim()}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ColumnProps {
  title: string;
  tasks: Task[];
  columnId: string;
  count: number;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAddComment: (taskId: string, content: string) => void;
  headerColor: string;
}

function Column({ title, tasks, columnId, count, onDelete, onToggle, onAddComment, headerColor }: ColumnProps) {
  return (
    <div className="flex flex-col bg-muted/30 rounded-xl border min-h-[400px] md:min-h-[500px]">
      <div className={`p-4 rounded-t-xl ${headerColor}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <span className="bg-background/80 text-foreground text-xs font-medium px-2 py-1 rounded-full">
            {count}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
          id={columnId}
        >
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              タスクがありません
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
                onToggle={onToggle}
                onAddComment={onAddComment}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function Todo() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Fetch tasks with comments from Supabase
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    // Fetch tasks for current user
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("id, text, completed")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      setIsLoading(false);
      return;
    }

    // Fetch all comments for these tasks with author info
    const taskIds = tasksData?.map((t) => t.id) || [];

    if (taskIds.length === 0) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select("id, task_id, author_id, content, users(name)")
      .in("task_id", taskIds)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
    }

    // Helper to get author name from users relation
    const getAuthorName = (users: DbComment["users"]): string => {
      if (!users) return "Unknown";
      if (Array.isArray(users)) {
        return users[0]?.name || "Unknown";
      }
      return users.name || "Unknown";
    };

    // Map comments to tasks
    const tasksWithComments: Task[] = (tasksData || []).map((task) => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      comments: (commentsData || [])
        .filter((c) => c.task_id === task.id)
        .map((c) => ({
          id: c.id,
          author_id: c.author_id,
          author_name: getAuthorName(c.users as DbComment["users"]),
          content: c.content,
        })),
    }));

    setTasks(tasksWithComments);
    setIsLoading(false);
  }, [user, supabase]);

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user, fetchTasks]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to tasks changes
    const tasksChannel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentsChannel = supabase
      .channel("comments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, supabase, fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const activeTask = tasks.find((task) => task.id === activeId);

  const handleAddTask = async () => {
    if (!user) return;

    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const { error } = await supabase.from("tasks").insert([
      {
        user_id: user.id,
        text: trimmedValue,
        completed: false,
      },
    ]);

    if (error) {
      console.error("Error adding task:", error);
      return;
    }

    setInputValue("");
    // Fetch tasks to update UI immediately
    fetchTasks();
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", id);

    if (error) {
      console.error("Error toggling task:", error);
      return;
    }
    fetchTasks();
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }
    fetchTasks();
  };

  const handleAddComment = async (taskId: string, content: string) => {
    if (!user) return;

    const { error } = await supabase.from("comments").insert([
      {
        task_id: taskId,
        author_id: user.id,
        content,
      },
    ]);

    if (error) {
      console.error("Error adding comment:", error);
      return;
    }
    fetchTasks();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    const overId = over.id as string;
    let newCompleted = draggedTask.completed;

    // Check if dropped on a column
    if (overId === "incomplete") {
      newCompleted = false;
    } else if (overId === "completed") {
      newCompleted = true;
    } else {
      // Dropped on another task - check which column
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newCompleted = overTask.completed;
      }
    }

    // Update if completion status changed
    if (newCompleted !== draggedTask.completed) {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: newCompleted })
        .eq("id", active.id);

      if (error) {
        console.error("Error updating task:", error);
        return;
      }
      fetchTasks();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Kanban Board</h1>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Kanban Board</h1>

      {/* Task Input Form */}
      <div className="flex gap-3 mb-8 max-w-md mx-auto">
        <Input
          type="text"
          placeholder="新しいタスクを入力..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-11"
        />
        <Button onClick={handleAddTask} className="h-11 px-6">
          <Plus className="h-4 w-4 mr-2" />
          追加
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="incomplete">
            <Column
              title="未完了"
              columnId="incomplete"
              tasks={incompleteTasks}
              count={incompleteTasks.length}
              onDelete={handleDeleteTask}
              onToggle={handleToggleComplete}
              onAddComment={handleAddComment}
              headerColor="bg-blue-100 dark:bg-blue-900/30"
            />
          </div>
          <div id="completed">
            <Column
              title="完了済み"
              columnId="completed"
              tasks={completedTasks}
              count={completedTasks.length}
              onDelete={handleDeleteTask}
              onToggle={handleToggleComplete}
              onAddComment={handleAddComment}
              headerColor="bg-green-100 dark:bg-green-900/30"
            />
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-card border rounded-lg p-4 shadow-lg rotate-3">
              <div className="flex items-start gap-3">
                <GripVertical className="h-4 w-4 mt-1 text-muted-foreground" />
                <p className="flex-1 text-sm">{activeTask.text}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
