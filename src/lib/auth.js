import { supabase } from "./supabase";

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from("authors")
    .select("role")
    .eq("email", user.email)
    .single();

  return data?.role === "admin";
};
