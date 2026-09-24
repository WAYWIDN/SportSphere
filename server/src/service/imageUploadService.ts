import cloudinary from '../config/cloudinaryConfig';
import envConfig from '../config/envConfig';
import { Request, Response } from 'express';

const generateSignedUploadParams = (resourceType: 'image' | 'raw') => {
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    folder: 'uploads',
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    envConfig.CLOUDINARY_API_SECRET,
  );

  return {
    timestamp,
    signature,
    folder: 'uploads',
    resource_type: resourceType,
    api_key: envConfig.CLOUDINARY_API_KEY,
    cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  };
};

export const getUploadSignature = (req: Request, res: Response) => {
  const { resource_type = 'image' } = req.body;

  if (resource_type !== 'image' && resource_type !== 'raw') {
    return res
      .status(400)
      .json({ success: false, message: 'resource_type must be image or raw' });
  }

  try {
    const data = generateSignedUploadParams(resource_type);

    return res.status(200).json({ success: true, data });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to generate upload signature' });
  }
};
