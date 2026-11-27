import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    })
  : null;

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function getUser(jid, pushName = '') {
  if (!supabase) {
    return {
      id: jid,
      name: pushName || jid.split('@')[0],
      push_name: pushName || '',
      limit_count: 100,
      last_reset: todayDateStr(),
      coin: 50,
      level: 1,
      prem: false,
      prem_until: null,
      afk_reason: null,
      is_banned: false,
    };
  }

  const today = todayDateStr();
  const { data: existing, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', jid)
    .maybeSingle();

  if (error) {
    console.error('[DB getUser error]', error.message);
    throw error;
  }

  if (!existing) {
    const newUser = {
      id: jid,
      name: pushName || jid.split('@')[0],
      push_name: pushName || '',
      limit_count: 100,
      last_reset: today,
      coin: 50,
      level: 1,
      prem: false,
      prem_until: null,
      afk_reason: null,
      is_banned: false,
    };
    const { data: inserted, error: insertError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (insertError) {
      console.error('[DB insertUser error]', insertError.message);
      return newUser;
    }
    return inserted;
  }

  const updates = {};
  if (pushName && existing.push_name !== pushName) {
    updates.push_name = pushName;
    if (!existing.name) updates.name = pushName;
  }

  if (existing.last_reset !== today) {
    updates.limit_count = 100;
    updates.last_reset = today;
  }

  if (existing.prem && existing.prem_until) {
    const expired = new Date(existing.prem_until).getTime() <= Date.now();
    if (expired) {
      updates.prem = false;
      updates.prem_until = null;
    }
  }

  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', jid)
      .select()
      .single();

    if (!updateError && updated) {
      return updated;
    }
  }

  return existing;
}

export async function saveUser(jid, updates) {
  if (!supabase) return { id: jid, ...updates };
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', jid)
    .select()
    .single();
  if (error) {
    console.error('[DB saveUser error]', error.message);
    return null;
  }
  return data;
}

export async function useLimit(jid, pushName = '') {
  const user = await getUser(jid, pushName);
  if (user.prem) {
    return true;
  }
  if (user.limit_count <= 0) {
    return false;
  }

  const nextLimit = user.limit_count - 1;
  let nextCoin = (user.coin || 0) + 1;
  let nextLevel = user.level || 1;

  if (nextCoin >= nextLevel * 100) {
    nextLevel += 1;
    nextCoin = 0;
  }

  await saveUser(jid, {
    limit_count: nextLimit,
    coin: nextCoin,
    level: nextLevel,
  });

  return true;
}

export async function addCoin(jid, jumlah, pushName = '') {
  const user = await getUser(jid, pushName);
  let nextCoin = Math.max(0, (user.coin || 0) + jumlah);
  let nextLevel = user.level || 1;

  while (nextCoin >= nextLevel * 100) {
    nextCoin -= nextLevel * 100;
    nextLevel += 1;
  }

  return saveUser(jid, {
    coin: nextCoin,
    level: nextLevel,
  });
}

export async function getAllUsers() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('users').select('*');
  if (error) return [];
  return data || [];
}

export async function getGroup(groupId, name = '') {
  if (!supabase) {
    return {
      id: groupId,
      name: name || 'Grup WhatsApp',
      welcome_text: 'Selamat datang @user di grup @group!',
      left_text: 'Selamat tinggal @user, semoga tenang di luar sana.',
      welcome_on: false,
      close_on: false,
      open_on: false,
      close_text: 'Grup telah ditutup oleh admin.',
      open_text: 'Grup telah dibuka oleh admin.',
      antilink: false,
      antibadword: false,
      antifoto: false,
      antistiker: false,
      antivideo: false,
      antitagsw: false,
      badwords: ['anjing', 'babi', 'bangsat', 'kontol', 'memek', 'asu', 'tolol', 'goblok'],
      sewa_until: null,
    };
  }

  const { data: existing, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .maybeSingle();

  if (error) {
    console.error('[DB getGroup error]', error.message);
    throw error;
  }

  if (!existing) {
    const newGroup = {
      id: groupId,
      name: name || 'Grup WhatsApp',
      welcome_on: false,
      close_on: false,
      open_on: false,
      antilink: false,
      antibadword: false,
      antifoto: false,
      antistiker: false,
      antivideo: false,
      antitagsw: false,
    };
    const { data: inserted, error: insertError } = await supabase
      .from('groups')
      .insert(newGroup)
      .select()
      .single();
    if (!insertError && inserted) return inserted;
    return { ...newGroup, badwords: ['anjing', 'babi', 'bangsat'] };
  }

  if (name && existing.name !== name) {
    const { data: updated } = await supabase
      .from('groups')
      .update({ name })
      .eq('id', groupId)
      .select()
      .single();
    if (updated) return updated;
  }

  return existing;
}

export async function saveGroup(groupId, updates) {
  if (!supabase) return { id: groupId, ...updates };
  await getGroup(groupId);
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single();
  if (error) {
    console.error('[DB saveGroup error]', error.message);
    return null;
  }
  return data;
}

export async function getAllGroups() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('groups').select('*');
  if (error) return [];
  return data || [];
}

export async function muteUser(groupId, userId, mutedUntilIso) {
  if (!supabase) return null;
  await getGroup(groupId);
  await supabase.from('group_muted').delete().eq('group_id', groupId).eq('user_id', userId);
  const { data } = await supabase
    .from('group_muted')
    .insert({ group_id: groupId, user_id: userId, muted_until: mutedUntilIso })
    .select()
    .single();
  return data;
}

export async function unmuteUser(groupId, userId) {
  if (!supabase) return;
  await supabase.from('group_muted').delete().eq('group_id', groupId).eq('user_id', userId);
}

export async function isUserMuted(groupId, userId) {
  if (!supabase) return false;
  const { data } = await supabase
    .from('group_muted')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return false;
  if (new Date(data.muted_until).getTime() <= Date.now()) {
    await unmuteUser(groupId, userId);
    return false;
  }
  return true;
}

export async function banGroupUser(groupId, userId) {
  if (!supabase) return null;
  const { data: existing } = await supabase
    .from('group_banned')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return existing;
  const { data } = await supabase
    .from('group_banned')
    .insert({ group_id: groupId, user_id: userId })
    .select()
    .single();
  return data;
}

export async function unbanGroupUser(groupId, userId) {
  if (!supabase) return;
  await supabase.from('group_banned').delete().eq('group_id', groupId).eq('user_id', userId);
}

export async function isUserGroupBanned(groupId, userId) {
  if (!supabase) return false;
  const { data } = await supabase
    .from('group_banned')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();
  return Boolean(data);
}

export async function markAbsen(groupId, userId) {
  if (!supabase) return { already: false };
  const tanggal = todayDateStr();
  const { data: existing } = await supabase
    .from('absen')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('tanggal', tanggal)
    .maybeSingle();

  if (existing) return { already: true };

  await supabase.from('absen').insert({ group_id: groupId, user_id: userId, tanggal });
  return { already: false };
}

export async function getAbsenToday(groupId) {
  if (!supabase) return [];
  const tanggal = todayDateStr();
  const { data } = await supabase
    .from('absen')
    .select('*')
    .eq('group_id', groupId)
    .eq('tanggal', tanggal)
    .order('created_at', { ascending: true });
  return data || [];
}

export async function clearAbsenToday(groupId) {
  if (!supabase) return;
  const tanggal = todayDateStr();
  await supabase.from('absen').delete().eq('group_id', groupId).eq('tanggal', tanggal);
}

export async function setCouple(groupId, userA, userB) {
  if (!supabase) return null;
  await supabase
    .from('couples')
    .delete()
    .eq('group_id', groupId)
    .or(`user_a.eq.${userA},user_b.eq.${userA},user_a.eq.${userB},user_b.eq.${userB}`);

  const { data } = await supabase
    .from('couples')
    .insert({ group_id: groupId, user_a: userA, user_b: userB })
    .select()
    .single();
  return data;
}

export async function getCouples(groupId) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('couples')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getAnonymousSession(userId) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('anonymous_sessions')
    .select('*')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .maybeSingle();
  return data || null;
}

export async function startAnonymousSession(userId) {
  if (!supabase) return { status: 'error', session: null };
  const existing = await getAnonymousSession(userId);
  if (existing) {
    return { status: existing.status === 'paired' ? 'already_paired' : 'already_waiting', session: existing };
  }

  const { data: waiting } = await supabase
    .from('anonymous_sessions')
    .select('*')
    .eq('status', 'waiting')
    .neq('user_a', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (waiting) {
    const { data: paired } = await supabase
      .from('anonymous_sessions')
      .update({ user_b: userId, status: 'paired' })
      .eq('id', waiting.id)
      .select()
      .single();
    return { status: 'paired', session: paired };
  }

  const sessionId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const { data: created } = await supabase
    .from('anonymous_sessions')
    .insert({ id: sessionId, user_a: userId, user_b: null, status: 'waiting' })
    .select()
    .single();

  return { status: 'waiting', session: created };
}

export async function leaveAnonymousSession(userId) {
  if (!supabase) return null;
  const existing = await getAnonymousSession(userId);
  if (!existing) return null;
  await supabase.from('anonymous_sessions').delete().eq('id', existing.id);
  return existing;
}

export async function getActiveGame(chatId) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

export async function startGameSession({ chatId, playerId, gameType, question, answer }) {
  if (!supabase) return null;
  await supabase.from('game_sessions').delete().eq('chat_id', chatId);
  const { data } = await supabase
    .from('game_sessions')
    .insert({
      chat_id: chatId,
      player_id: playerId,
      game_type: gameType,
      question,
      answer,
    })
    .select()
    .single();
  return data;
}

export async function clearGameSession(chatId) {
  if (!supabase) return;
  await supabase.from('game_sessions').delete().eq('chat_id', chatId);
}

export async function getSetting(key, defaultValue = '') {
  if (!supabase) return defaultValue;
  const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
  return data ? data.value : defaultValue;
}

export async function setSetting(key, value) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('settings')
    .upsert({ key, value: String(value) }, { onConflict: 'key' })
    .select()
    .single();
  return data;
}

export async function getStats() {
  if (!supabase) {
    return { totalUser: 0, totalGroup: 0, totalCoin: 0, supabaseConnected: false };
  }

  try {
    const [{ count: userCount, data: usersData }, { count: groupCount }] = await Promise.all([
      supabase.from('users').select('coin', { count: 'exact' }),
      supabase.from('groups').select('id', { count: 'exact', head: true }),
    ]);

    const totalCoin = (usersData || []).reduce((acc, row) => acc + (Number(row.coin) || 0), 0);

    return {
      totalUser: userCount || 0,
      totalGroup: groupCount || 0,
      totalCoin,
      supabaseConnected: true,
    };
  } catch (err) {
    console.error('[DB getStats error]', err.message);
    return { totalUser: 0, totalGroup: 0, totalCoin: 0, supabaseConnected: false };
  }
}
