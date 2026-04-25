"use server";

import { exec } from "child_process";
import { promisify } from "util";
import { getSession } from "@/lib/auth";
import path from "path";

const execPromise = promisify(exec);

export async function checkSystemUpdateAction() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  try {
    const scriptPath = path.join(process.cwd(), "scripts", "check-version.sh");
    // Ensure the script is executable (Linux only, but good practice)
    if (process.platform !== "win32") {
      await execPromise(`chmod +x ${scriptPath}`);
    }
    
    const { stdout } = await execPromise(`sh ${scriptPath}`);
    const data = JSON.parse(stdout);
    
    return {
      success: true,
      localHash: data.local.substring(0, 7),
      remoteHash: data.remote.substring(0, 7),
      isUpdateAvailable: data.local !== data.remote
    };
  } catch (error: any) {
    console.error("Update check failed:", error);
    return { success: false, error: error.message };
  }
}

export async function deploySystemUpdateAction() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  try {
    const scriptPath = path.join(process.cwd(), "scripts", "deploy.sh");
    
    if (process.platform !== "win32") {
      await execPromise(`chmod +x ${scriptPath}`);
    }

    // We run the deployment in the background to avoid timeout
    // In a real environment, we would use a more robust queue, 
    // but for this enterprise setup, exec is fine for now.
    const { stdout, stderr } = await execPromise(`sh ${scriptPath}`);
    
    return { 
      success: true, 
      log: stdout,
      errorLog: stderr 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSystemLogsAction() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  try {
    const logPath = path.join(process.cwd(), "deployment.log");
    const { stdout } = await execPromise(`tail -n 50 ${logPath}`);
    return { success: true, logs: stdout };
  } catch (error) {
    return { success: false, logs: "No logs found." };
  }
}
