import { supabase } from '@/integrations/supabase/client';

export const ensureStorageBuckets = async () => {
  try {
    // Check if documents bucket exists
    const { data: documentsBucket, error: documentsError } = await supabase.storage.getBucket('documents');
    
    if (documentsError && documentsError.message.includes('Bucket not found')) {
      console.log('Creating documents bucket...');
      const { error: createDocumentsError } = await supabase.storage.createBucket('documents', {
        public: true
      });
      
      if (createDocumentsError) {
        console.warn('Could not create documents bucket:', createDocumentsError.message);
      } else {
        console.log('✅ Documents bucket created successfully');
      }
    }

    // Check if result-photos bucket exists
    const { data: photosBucket, error: photosError } = await supabase.storage.getBucket('result-photos');
    
    if (photosError && photosError.message.includes('Bucket not found')) {
      console.log('Creating result-photos bucket...');
      const { error: createPhotosError } = await supabase.storage.createBucket('result-photos', {
        public: true
      });
      
      if (createPhotosError) {
        console.warn('Could not create result-photos bucket:', createPhotosError.message);
      } else {
        console.log('✅ Result photos bucket created successfully');
      }
    }

    console.log('Storage buckets are ready!');
  } catch (error) {
    console.error('Error ensuring storage buckets:', error);
  }
};
