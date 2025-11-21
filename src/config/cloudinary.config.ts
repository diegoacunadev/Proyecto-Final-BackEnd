import { v2 as cloudinary } from 'cloudinary';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.development.env' });


export const ClaudinaryConfig = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    cloudinary.config({ 
      cloud_name: process.env.CLOUD_NAME, // Add your cloud name
      api_key: process.env.CLOUD_API_KEY, 
      api_secret: process.env.CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret  
    });
  },
}
