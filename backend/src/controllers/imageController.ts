import { Request, Response } from 'express';
import path from 'path';

export const serveImage = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    // TODO: Validate filename and serve file
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({
          success: false,
          error: 'Image not found',
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to serve image',
    });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Delete image from database and filesystem
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
    });
  }
};