import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * StorageService
 * 
 * This service acts as an abstraction layer for file storage.
 * Currently, it saves files to the local file system.
 * In the future, this class will be updated to upload files to AWS S3, 
 * Cloudflare R2, or DigitalOcean Spaces without needing to change any API routes.
 */
export class StorageService {
  /**
   * Uploads a file to the storage provider.
   * 
   * @param file The File object from FormData
   * @param folder The target folder name (e.g., 'documents', 'products')
   * @returns The relative path or CDN URL of the uploaded file
   */
  static async upload(file: File, folder: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure we keep the original extension
    const ext = file.name.split(".").pop() || "bin";
    
    // Generate a highly unique filename to prevent collisions
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    
    // ==========================================
    // PHASE 1: LOCAL STORAGE IMPLEMENTATION
    // ==========================================
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    
    // Ensure the directory exists
    await mkdir(dir, { recursive: true });
    
    // Write the file to disk
    await writeFile(path.join(dir, filename), buffer);

    // Return the relative URL string that will be saved in the database
    return `/uploads/${folder}/${filename}`;

    // ==========================================
    // PHASE 2: MULTI-CLOUD STORAGE IMPLEMENTATION (FUTURE)
    // ==========================================
    // Depending on your choice (Wasabi, Azure, Google Cloud, or S3), 
    // you will configure an environment variable like STORAGE_PROVIDER="wasabi"
    // and initialize the correct client here.
    
    /*
    const provider = process.env.STORAGE_PROVIDER; // "local", "wasabi", "azure", "gcp"

    if (provider === "wasabi" || provider === "s3") {
      // Wasabi uses the exact same S3 API
      const s3Client = new S3Client({ endpoint: process.env.WASABI_ENDPOINT, ... });
      const command = new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: `${folder}/${filename}`, Body: buffer, ContentType: file.type });
      await s3Client.send(command);
      return `${process.env.NEXT_PUBLIC_CDN_URL}/${folder}/${filename}`;
    } 
    else if (provider === "azure") {
      // Azure Blob Storage Implementation
      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
      const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);
      const blockBlobClient = containerClient.getBlockBlobClient(`${folder}/${filename}`);
      await blockBlobClient.uploadData(buffer);
      return `${process.env.NEXT_PUBLIC_CDN_URL}/${folder}/${filename}`;
    }
    else if (provider === "gcp") {
      // Google Cloud Storage Implementation
      const storage = new Storage();
      const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
      const cloudFile = bucket.file(`${folder}/${filename}`);
      await cloudFile.save(buffer);
      return `${process.env.NEXT_PUBLIC_CDN_URL}/${folder}/${filename}`;
    }
    */
  }
}
