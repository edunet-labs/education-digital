
import { supabase } from './config.js';

const TOPICS_TABLE = 'forum_topics';
const REPLIES_TABLE = 'forum_replies';
const IMAGES_BUCKET = 'forum-images';

export const forumRepository = {
    // Get all topics (with reply count)
    async getAllTopics() {
        try {
            const { data, error } = await supabase
                .from(TOPICS_TABLE)
                .select(`
                    *,
                    forum_replies (count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching topics:', error);
            throw error;
        }
    },

    // Get specific topic with all replies
    async getTopicById(id) {
        try {
            const { data, error } = await supabase
                .from(TOPICS_TABLE)
                .select(`
                    *,
                    forum_replies (*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            // Sort replies by time
            if (data && data.forum_replies) {
                data.forum_replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            }

            return data;
        } catch (error) {
            console.error(`Error fetching topic ${id}:`, error);
            throw error;
        }
    },

    // Create a new topic
    async createTopic(topicData) {
        try {
            const { data, error } = await supabase
                .from(TOPICS_TABLE)
                .insert([topicData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating topic:', error);
            throw error;
        }
    },

    // Create a reply
    async createReply(replyData) {
        try {
            const { data, error } = await supabase
                .from(REPLIES_TABLE)
                .insert([replyData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating reply:', error);
            throw error;
        }
    },

    // Upload image
    async uploadImage(file) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from(IMAGES_BUCKET)
                .upload(filePath, file);

            if (error) throw error;

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from(IMAGES_BUCKET)
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    // Subscribe to new topics (Realtime)
    subscribeToNewTopics(callback) {
        return supabase
            .channel('public:forum_topics')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TOPICS_TABLE }, payload => {
                callback(payload.new);
            })
            .subscribe();
    },

    // Delete a topic
    async deleteTopic(id) {
        try {
            const { error } = await supabase
                .from(TOPICS_TABLE)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error(`Error deleting topic ${id}:`, error);
            throw error;
        }
    },

    // Delete a reply
    async deleteReply(id) {
        try {
            const { error } = await supabase
                .from(REPLIES_TABLE)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error(`Error deleting reply ${id}:`, error);
            throw error;
        }
    }
};
