import { supabase } from "../lib/supabase";

export const uploadSignature = async (
	base64Image: string,
	userId: string
): Promise<string> => {
	try {
		// Convert base64 to blob
		const base64Response = await fetch(base64Image);
		const blob = await base64Response.blob();

		// Generate a unique filename
		const filename = `signatures/${userId}_${Date.now()}.png`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from("signatures")
			.upload(filename, blob, {
				contentType: "image/png",
				upsert: true,
			});

		if (error) {
			throw error;
		}

		// Get the public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from("signatures").getPublicUrl(filename);

		return publicUrl;
	} catch (error) {
		console.error("Error uploading signature:", error);
		throw error;
	}
};
