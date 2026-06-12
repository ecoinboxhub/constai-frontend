import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Calendar, User, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string | null;
  cover_image: string | null;
  tags: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["blog-articles"],
    queryFn: async () => {
      const res = await api.get("/blog/articles?limit=50");
      return res.data;
    },
  });

  const articles: BlogArticle[] = data?.articles ?? [];

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-500">Construction insights, guides, and platform updates</p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No articles yet</h3>
          <p className="text-sm text-slate-400">Blog posts will appear here once published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
            >
              {article.cover_image && (
                <div className="h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  {article.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {article.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.published_at)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-3">{article.excerpt}</p>
                )}
                {article.tags && (
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <div className="flex gap-1.5">
                      {article.tags.split(",").map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Read more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
