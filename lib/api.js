import { supabase } from "./supabaseClient";

// ---------- reference: location ----------

export async function fetchProvinces() {
  const { data, error } = await supabase.from("provinces").select("*").order("name");
  if (error) throw error;
  return data;
}
export async function createProvince(name) {
  const { error } = await supabase.from("provinces").insert({ name });
  if (error) throw error;
}
export async function deleteProvince(id) {
  const { error } = await supabase.from("provinces").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchDistricts() {
  const { data, error } = await supabase.from("districts").select("*").order("name");
  if (error) throw error;
  return data;
}
export async function createDistrict(provinceId, name) {
  const { error } = await supabase.from("districts").insert({ province_id: provinceId, name });
  if (error) throw error;
}
export async function deleteDistrict(id) {
  const { error } = await supabase.from("districts").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchClusters() {
  const { data, error } = await supabase.from("village_clusters").select("*").order("name");
  if (error) throw error;
  return data;
}
export async function createCluster(districtId, name) {
  const { error } = await supabase.from("village_clusters").insert({ district_id: districtId, name });
  if (error) throw error;
}
export async function deleteCluster(id) {
  const { error } = await supabase.from("village_clusters").delete().eq("id", id);
  if (error) throw error;
}

// ---------- reference: activity types ----------

export async function fetchMainTypes() {
  const { data, error } = await supabase.from("activity_main_types").select("*").order("name");
  if (error) throw error;
  return data;
}
export async function createMainType(name) {
  const { error } = await supabase.from("activity_main_types").insert({ name });
  if (error) throw error;
}
export async function deleteMainType(id) {
  const { error } = await supabase.from("activity_main_types").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchSubTypes() {
  const { data, error } = await supabase.from("activity_sub_types").select("*").order("name");
  if (error) throw error;
  return data;
}
export async function createSubType(mainId, name) {
  const { error } = await supabase.from("activity_sub_types").insert({ main_id: mainId, name });
  if (error) throw error;
}
export async function deleteSubType(id) {
  const { error } = await supabase.from("activity_sub_types").delete().eq("id", id);
  if (error) throw error;
}

// ---------- people ----------

export async function fetchPeople() {
  const { data, error } = await supabase.from("people").select("*").order("created_at");
  if (error) throw error;
  return data;
}
export async function createPerson(person) {
  const { error } = await supabase.from("people").insert(person);
  if (error) throw error;
}
export async function updatePerson(id, person) {
  const { error } = await supabase.from("people").update(person).eq("id", id);
  if (error) throw error;
}
export async function deletePerson(id) {
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw error;
}

// ---------- activities ----------

export async function fetchActivities() {
  const { data, error } = await supabase.from("activities").select("*").order("activity_date", { ascending: false });
  if (error) throw error;
  return data;
}
export async function fetchActivity(id) {
  const { data, error } = await supabase.from("activities").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
export async function createActivity(activity) {
  const { error } = await supabase.from("activities").insert(activity);
  if (error) throw error;
}
export async function updateActivity(id, activity) {
  const { error } = await supabase.from("activities").update(activity).eq("id", id);
  if (error) throw error;
}
export async function deleteActivity(id) {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw error;
}

// ---------- participants ----------

export async function fetchParticipants(activityId) {
  const { data, error } = await supabase
    .from("activity_participants")
    .select("*, people(*)")
    .eq("activity_id", activityId);
  if (error) throw error;
  return data;
}
export async function fetchParticipationCounts() {
  const { data, error } = await supabase.from("activity_participants").select("activity_id");
  if (error) throw error;
  const counts = {};
  for (const row of data) counts[row.activity_id] = (counts[row.activity_id] || 0) + 1;
  return counts;
}
export async function addParticipant(activityId, personId, role) {
  const { error } = await supabase
    .from("activity_participants")
    .insert({ activity_id: activityId, person_id: personId, role });
  if (error) throw error;
}
export async function removeParticipant(activityId, personId) {
  const { error } = await supabase
    .from("activity_participants")
    .delete()
    .eq("activity_id", activityId)
    .eq("person_id", personId);
  if (error) throw error;
}
export async function updateParticipantRole(activityId, personId, role) {
  const { error } = await supabase
    .from("activity_participants")
    .update({ role })
    .eq("activity_id", activityId)
    .eq("person_id", personId);
  if (error) throw error;
}
