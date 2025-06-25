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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
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
