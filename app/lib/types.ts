export type Note = {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  category: string
  is_archived: boolean
  is_public: boolean
  share_id: string
  ai_summary: string | null
  ai_action_items: string[] | null
  ai_suggested_title: string | null
  created_at: string
  updated_at: string
}