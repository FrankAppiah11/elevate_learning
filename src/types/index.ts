export type UserRole = "student" | "instructor";

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  student_id: string;
  instructor_id?: string;
  module_id?: string;
  upload_type: "screenshot" | "document" | "pdf" | "text" | "weblink";
  file_url?: string;
  file_name?: string;
  text_content?: string;
  web_url?: string;
  status: "draft" | "in_progress" | "submitted" | "graded" | "reviewed";
  folder_label: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  instructor_id: string;
  created_at: string;
}

export interface AITutor {
  id: string;
  name: string;
  style: "socratic" | "structured" | "exploratory";
  description: string;
  avatar_color: string;
  system_prompt: string;
}

export interface TutorInteraction {
  id: string;
  assignment_id: string;
  student_id: string;
  tutor_id: string;
  role: "student" | "tutor";
  content: string;
  interaction_type: "question" | "answer" | "hint" | "example" | "clarification" | "go_back";
  timestamp: string;
}

export interface TutorSession {
  id: string;
  assignment_id: string;
  student_id: string;
  tutor_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  total_messages: number;
  go_backs: number;
  status: "active" | "paused" | "completed";
}

export interface GradingResult {
  id: string;
  assignment_id: string;
  student_id: string;
  problem_solving_score: number;
  ai_competency_score: number;
  correctness_score: number;
  weighted_total: number;
  letter_grade: string;
  grading_details: {
    problem_solving_analysis: string;
    ai_competency_analysis: string;
    correctness_analysis: string;
  };
  ai_graded_at: string;
  instructor_grade?: string;
  instructor_notes?: string;
  instructor_graded_at?: string;
}

export interface FeedbackReport {
  id: string;
  assignment_id: string;
  student_id: string;
  narrative_report: string;
  strengths: string[];
  areas_for_improvement: string[];
  key_suggestions: string[];
  competency_breakdown: {
    logical_reasoning: number;
    concept_integration: number;
    formula_accuracy: number;
  };
  generated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "submission" | "grade" | "feedback" | "review";
  related_assignment_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface StudentActivity {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  assignment_title: string;
  assignment_id: string;
  status: string;
  ai_preliminary_score?: number;
  submitted_at?: string;
}
