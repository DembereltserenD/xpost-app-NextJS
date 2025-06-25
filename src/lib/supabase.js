import { createClient } from "@supabase/supabase-js";

// Get environment variables with fallbacks
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://yugkxkosszvkkmvdsehu.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2t4a29zc3p2a2ttdmRzZWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDM2NTksImV4cCI6MjA2NjAxOTY1OX0.mC5SLlZl8sRpCuSM-NVPCbZ3ptR33RuJ1urDC-C8azo";

// Create a simple mock client for development
const mockClient = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () =>
      Promise.resolve({
        data: null,
        error: { message: "Supabase not configured" },
      }),
    update: () =>
      Promise.resolve({
        data: null,
        error: { message: "Supabase not configured" },
      }),
    delete: () =>
      Promise.resolve({
        data: null,
        error: { message: "Supabase not configured" },
      }),
    eq: function () {
      return this;
    },
    single: () =>
      Promise.resolve({
        data: null,
        error: { message: "Supabase not configured" },
      }),
    order: function () {
      return this;
    },
    limit: function () {
      return this;
    },
    range: function () {
      return this;
    },
    textSearch: function () {
      return this;
    },
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () =>
      Promise.resolve({
        data: null,
        error: { message: "Supabase not configured" },
      }),
    signOut: () => Promise.resolve({ error: null }),
  },
  storage: {
    from: () => ({
      upload: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
  rpc: () => Promise.resolve({ data: null, error: null }),
};

// Enhanced URL validation
const isValidUrl = (url) => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return false;
  }

  // Check for common invalid patterns
  if (url === "undefined" || url === "null" || url.startsWith("${")) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return (
      ((urlObj.protocol === "http:" || urlObj.protocol === "https:") &&
        urlObj.hostname &&
        urlObj.hostname !== "localhost") ||
      urlObj.hostname === "localhost"
    );
  } catch (error) {
    return false;
  }
};

// Enhanced key validation
const isValidKey = (key) => {
  return (
    key &&
    typeof key === "string" &&
    key.trim() !== "" &&
    key !== "undefined" &&
    key !== "null" &&
    !key.startsWith("${")
  );
};

// Initialize Supabase client with comprehensive error handling
let supabase;

// Function to safely initialize Supabase
const initializeSupabase = () => {
  try {
    // Detailed validation logging
    console.log("Initializing Supabase client...");
    console.log("URL provided:", supabaseUrl ? "[PRESENT]" : "[MISSING]");
    console.log("Key provided:", supabaseAnonKey ? "[PRESENT]" : "[MISSING]");

    // Check if environment variables exist and are valid
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        "❌ Missing Supabase environment variables. Using mock client for development.",
      );
      return mockClient;
    }

    if (!isValidUrl(supabaseUrl)) {
      console.warn(
        `❌ Invalid Supabase URL format: "${supabaseUrl}". Using mock client for development.`,
      );
      return mockClient;
    }

    if (!isValidKey(supabaseAnonKey)) {
      console.warn(
        "❌ Invalid Supabase anon key format. Using mock client for development.",
      );
      return mockClient;
    }

    // Attempt to create the Supabase client
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Prevent auth issues during development
      },
    });

    console.log("✅ Supabase client initialized successfully");
    return client;
  } catch (error) {
    console.error(
      "❌ Failed to initialize Supabase client. Using mock client for development.",
      {
        error: error.message,
        url: supabaseUrl ? "[PRESENT]" : "[MISSING]",
        key: supabaseAnonKey ? "[PRESENT]" : "[MISSING]",
      },
    );
    return mockClient;
  }
};

// Initialize the client
supabase = initializeSupabase();

export { supabase };

// Database helpers
export const getArticles = async (limit, offset = 0, category = null) => {
  let query = supabase
    .from("articles")
    .select(
      `
      *,
      authors(name, avatar_url),
      categories(name, slug)
    `,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();

    if (categoryData) {
      query = query.eq("category_id", categoryData.id);
    }
  }

  if (limit) query = query.limit(limit);
  if (offset) query = query.range(offset, offset + limit - 1);

  return await query;
};

export const getArticleBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      authors(name, avatar_url, bio),
      categories(name, slug)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!error && data) {
    await supabase.rpc("increment_views", { article_id: data.id });
  }

  return { data, error };
};

export const searchArticles = async (query) => {
  return await supabase
    .from("articles")
    .select(
      `
      *,
      authors(name, avatar_url),
      categories(name, slug)
    `,
    )
    .textSearch("title,content,excerpt", query)
    .eq("status", "published")
    .order("published_at", { ascending: false });
};

export const getCategories = async () => {
  try {
    const result = supabase.from("categories").select("*");
    if (result && typeof result.order === "function") {
      return await result.order("name");
    }
    return await result;
  } catch (error) {
    console.error("Error in getCategories:", error);
    return { data: [], error };
  }
};

export const getComments = async (articleId) => {
  return await supabase
    .from("comments")
    .select("*")
    .eq("article_id", articleId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
};

export const addComment = async (articleId, name, email, content) => {
  return await supabase.from("comments").insert({
    article_id: articleId,
    name,
    email,
    content,
    status: "pending",
  });
};

// Admin helpers
export const getAdminArticles = async () => {
  return await supabase
    .from("articles")
    .select(
      `
      *,
      authors(name),
      categories(name)
    `,
    )
    .order("created_at", { ascending: false });
};

export const createArticle = async (articleData) => {
  return await supabase.from("articles").insert(articleData).select().single();
};

export const updateArticle = async (id, articleData) => {
  return await supabase
    .from("articles")
    .update(articleData)
    .eq("id", id)
    .select()
    .single();
};

export const deleteArticle = async (id) => {
  return await supabase.from("articles").delete().eq("id", id);
};

export const getAuthors = async () => {
  return await supabase.from("authors").select("*").order("name");
};

export const getArticleById = async (id) => {
  return await supabase
    .from("articles")
    .select(
      `
      *,
      authors(name, avatar_url, bio),
      categories(name, slug)
    `,
    )
    .eq("id", id)
    .single();
};

export const uploadImage = async (file, bucket = "images") => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) return { error };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return { data: { publicUrl }, error: null };
};
