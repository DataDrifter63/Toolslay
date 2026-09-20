"use client";

import { useParams } from "next/navigation";
import PostForm from "@/components/admin/PostForm";

export default function EditPostPage() {
  const { id } = useParams();
  return <PostForm postId={id} />;
}
