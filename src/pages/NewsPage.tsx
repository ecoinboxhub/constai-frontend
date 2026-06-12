import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Newspaper, Calendar, ArrowRight, Globe, Tag } from "lucide-react";
import api from "@/lib/api";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  source: string | null;
  source_url: string | null;
  cover_image: string | null;
  category: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function NewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const res = await api.get("/news/articles?limit=50");
      return res.data;
    },
  });

  const articles: NewsArticle[] = data?.articles ?? [];

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
        <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          <Newspaper className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Industry News</h1>
          <p className="text-sm text-slate-500">Latest construction project news and industry updates</p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No news yet</h3>
          <p className="text-sm text-slate-400">News articles will appear here once published.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
            >
              <div className="flex items-start gap-5">
                {article.cover_image && (
                  <div className="w-32 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 hidden sm:block">
                    <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    {article.category && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                        <Tag className="w-3 h-3" />
                        {article.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-slate-500 line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    {article.source && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Globe className="w-3 h-3" />
                        {article.source}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold group-hover:gap-2 transition-all">
                      Read full story <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
