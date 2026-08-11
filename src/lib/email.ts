import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { supabase } from "./supabase";

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

type TemplateParams = {
	email: string;
	title: string;
	subtitle: string;
	content: string;
	event: string;
	event_datetime: string;
	link: string;
};

export const sendEmails = async (
	emails: string[],
	data: Omit<TemplateParams, "email">,
	id: number,
	fetchNewsletters: () => Promise<void>
) => {
	const failedEmails: string[] = [];
	let successCount = 0;

	for (const email of emails) {
		const templateParams: TemplateParams = {
			email,
			...data,
		};

		try {
			const response = await emailjs.send(
				"service_ak9gokh",
				"template_jhxpnet",
				templateParams
			);

			console.log(`SUCCESS for ${email}`, response.status);

			successCount++;
		} catch (err) {
			console.log(`FAILED for ${email}`, err);

			failedEmails.push(email);
		}

		// prevent EmailJS rate limits
		await new Promise((resolve) => setTimeout(resolve, 1500));
	}

	// final toast
	if (failedEmails.length === 0) {
		toast.success(
			`Successfully sent ${successCount} emails`,
			{
				position: "top-right",
				autoClose: 3000,
			}
		);

		 await supabase
			.from('newsletters')
			.update({ status: 'published' })
			 .eq("id", id)
			.select()

	} else {
		toast.warning(
			`${successCount} emails sent, ${failedEmails.length} failed`,
			{
				position: "top-right",
				autoClose: 5000,
			}
		);

		console.log("Failed emails:", failedEmails);
	}
	await fetchNewsletters();
	return {
		successCount,
		failedEmails,
	};
};