
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import type { UserProfile, Job, SkillGapAnalysis, CompanyPrepInfo, ApplicantRanking, ProfileFeedback } from '../types';

// Initialize the Google AI client
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

const profileSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        summary: { type: Type.STRING },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ["company", "role", "startDate", "endDate", "description"],
            },
        },
        internships: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ["company", "role", "startDate", "endDate", "description"],
            },
        },
        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    link: { type: Type.STRING },
                },
                required: ["name", "description", "skills"],
            },
        },
        education: {
            type: Type.OBJECT,
            properties: {
                tenth: {
                    type: Type.OBJECT,
                    properties: {
                        institution: { type: Type.STRING },
                        board: { type: Type.STRING },
                        year: { type: Type.STRING },
                        score: { type: Type.STRING },
                    },
                    required: ["institution", "board", "year", "score"],
                },
                twelfth: {
                    type: Type.OBJECT,
                    properties: {
                        institution: { type: Type.STRING },
                        board: { type: Type.STRING },
                        year: { type: Type.STRING },
                        score: { type: Type.STRING },
                    },
                     required: ["institution", "board", "year", "score"],
                },
                undergraduate: {
                    type: Type.OBJECT,
                    properties: {
                        institution: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        fieldOfStudy: { type: Type.STRING },
                        startYear: { type: Type.STRING },
                        endYear: { type: Type.STRING },
                        score: { type: Type.STRING },
                    },
                    required: ["institution", "degree", "fieldOfStudy", "startYear", "endYear", "score"],
                },
            },
        },
        valueProposition: { type: Type.STRING, description: "A brief summary of what the candidate can offer to a company as a fresher." },
        links: {
            type: Type.OBJECT,
            properties: {
                linkedIn: { type: Type.STRING },
                github: { type: Type.STRING },
                portfolio: { type: Type.STRING },
            }
        },
        languages: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    proficiency: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'] },
                },
                required: ["name", "proficiency"]
            }
        },
        certifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    issuingBody: { type: Type.STRING },
                    date: { type: Type.STRING },
                    credentialUrl: { type: Type.STRING },
                },
                required: ["name", "issuingBody", "date"]
            }
        },
        achievements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    date: { type: Type.STRING },
                },
                required: ["title", "description", "date"]
            }
        },
        relevantCoursework: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        responsibilities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING },
                    organization: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ["role", "organization", "description"],
            },
        },
    },
    required: ["fullName", "email", "phone", "summary", "skills", "experience", "education", "internships", "projects", "valueProposition"],
};

/**
 * Parses resume text to extract structured user profile data.
 */
export const parseResumeWithAI = async (resumeText: string): Promise<UserProfile> => {
    const prompt = `
        Parse the following resume text and extract the information into a JSON object.
        - Ensure all date fields are formatted as "Month YYYY" or "YYYY". If an end date is "Present" or "Current", use that value.
        - For experience descriptions, combine bullet points into a single string with newline characters.
        - The "valueProposition" should be a concise summary targeted at what a fresher can bring to a company, derived from the resume's overall tone and content.
        - Extract any relevant university/college courses mentioned.
        - Extract positions of responsibility from extracurricular activities (e.g., "President of Coding Club").
        - If a section like internships, projects, links, languages, certifications, achievements, coursework, or responsibilities is not present, return an empty array or empty object for it.
        
        Here is the resume text:
        ---
        ${resumeText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: profileSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as UserProfile;
    } catch (error) {
        console.error("Error parsing resume with AI:", error);
        throw new Error("Failed to parse resume text with AI.");
    }
};

export const parseResumePdfWithAI = async (pdfBase64: string): Promise<UserProfile> => {
    const prompt = `
        Parse the attached resume PDF and extract the information into a JSON object.
        - Ensure all date fields are formatted as "Month YYYY" or "YYYY". If an end date is "Present" or "Current", use that value.
        - For experience descriptions, combine bullet points into a single string with newline characters.
        - The "valueProposition" should be a concise summary targeted at what a fresher can bring to a company, derived from the resume's overall tone and content.
        - Extract any relevant university/college courses mentioned.
        - Extract positions of responsibility from extracurricular activities (e.g., "President of Coding Club").
        - If a section like internships, projects, links, languages, certifications, achievements, coursework, or responsibilities is not present, return an empty array or empty object for it.
        - Extract email, phone, and full name from the resume header/contact section.
    `;

    try {
        const pdfPart = {
            inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
            },
        };
        const textPart = { text: prompt };
        
        const response = await ai.models.generateContent({
            model: textModel,
            contents: { parts: [textPart, pdfPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: profileSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as UserProfile;
    } catch (error: any) {
        console.error("Error parsing resume PDF with AI:", error);
        const errorMessage = error?.message || error?.toString() || "Unknown error";
        // Provide more specific error messages
        if (errorMessage.includes("file size") || errorMessage.includes("too large")) {
            throw new Error("PDF file is too large. Please use a file smaller than 20MB or extract text manually.");
        }
        if (errorMessage.includes("invalid") || errorMessage.includes("format")) {
            throw new Error("PDF format is not supported. Please ensure the PDF is not password-protected or corrupted.");
        }
        if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error(`Failed to parse resume PDF: ${errorMessage}. Please try a different PDF or fill the profile manually.`);
    }
};

/**
 * Generates job recommendations based on user profile and available jobs.
 */
export const getJobRecommendationsWithAI = async (userProfile: UserProfile, allJobs: Job[]): Promise<Job[]> => {
  const profileSummary = `
    User Profile:
    - Summary: ${userProfile.summary}
    - Skills: ${userProfile.skills.join(', ')}
    - Experience: ${userProfile.experience.map(exp => `${exp.role} at ${exp.company}`).join('; ')}
    - Projects: ${userProfile.projects.map(p => p.name).join(', ')}
    - Education: ${userProfile.education.undergraduate.degree} in ${userProfile.education.undergraduate.fieldOfStudy}
  `;

  const jobsList = allJobs.map(job => `
    Job ID: ${job.id}
    Title: ${job.title}
    Company: ${job.company}
    Description: ${job.description}
    Skills: ${job.skills.join(', ')}
  `).join('\n---\n');

  const prompt = `
    Based on the following user profile, please recommend the top 10 most relevant jobs from the provided list.
    Return only a JSON array of the job IDs that are the best match, ordered from most to least relevant.
    Do not include any other text or explanation.

    Example output: [3, 1, 8, 5, 2]

    ${profileSummary}

    Available Jobs:
    ${jobsList}
  `;

  try {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER }
            }
        }
    });
    const text = response.text;
    const recommendedIds = JSON.parse(text.trim()) as number[];
    const recommendedJobs = allJobs.filter(job => recommendedIds.includes(job.id));
    // Sort them based on the AI's recommendation order
    recommendedJobs.sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id));
    return recommendedJobs;
  } catch (error) {
    console.error("Error getting job recommendations:", error);
    // Fallback to a simple keyword match if AI fails
    const userSkillsLower = userProfile.skills.map(s => s.toLowerCase());
    return allJobs
        .map(job => {
            const matchCount = job.skills.filter(s => userSkillsLower.includes(s.toLowerCase())).length;
            return { job, matchCount };
        })
        .filter(item => item.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .map(item => item.job)
        .slice(0, 10);
  }
};


/**
 * Chat functionality
 */
export const DEFAULT_SYSTEM_INSTRUCTION = "You are CareerBot, a friendly and professional AI career coach. You provide helpful advice on resumes, interviews, and career planning. Keep your responses concise and encouraging.";

export const createChatInstance = (systemInstruction: string): Chat => {
  return ai.chats.create({
    model: textModel,
    config: {
      systemInstruction,
    },
  });
};

export const sendMessageToAI = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};

/**
 * Interview Prep functionality
 */

export const getInterviewQuestions = async (jobRole: string): Promise<string[]> => {
    const prompt = `Generate 5 common but important interview questions for a "${jobRole}" position. Return them as a JSON array of strings. Do not include any other text. Example: ["question 1", "question 2"]`;
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const text = response.text.trim();
        // FIX: Add type assertion to ensure correct return type.
        return JSON.parse(text) as string[];
    } catch (error) {
        console.error("Error getting interview questions:", error);
        throw new Error("Failed to generate interview questions.");
    }
};

export const getVerbalAnswerFeedbackWithAI = async (question: string, jobRole: string, audioBase64: string, audioMimeType: string): Promise<string> => {
    const prompt = `
        You are an expert interviewer for a "${jobRole}" position. Analyze the user's verbal answer to the following question: "${question}".
        The user's audio response is provided.
        Provide constructive feedback in three sections using markdown:
        1.  **Content & Structure:** Was the answer relevant? Did it follow a clear structure like the STAR method? Was it impactful?
        2.  **Clarity & Pacing:** Was the user easy to understand? Did they speak too fast or too slow? Did they use many filler words (e.g., "um", "ah")? (Infer this from the audio).
        3.  **Overall Impression & Tips:** Give an overall impression and 1-2 actionable tips for improvement.
        Keep the feedback helpful, specific, and encouraging.
    `;
    
    try {
        const audioPart = {
            inlineData: {
              mimeType: audioMimeType,
              data: audioBase64,
            },
        };
        const textPart = { text: prompt };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: textModel,
          contents: { parts: [textPart, audioPart] },
        });

        return response.text;

    } catch (error) {
        console.error("Error getting verbal answer feedback:", error);
        throw new Error("AI failed to analyze your verbal answer.");
    }
};


/**
 * Generates a company logo.
 */
export const generateCompanyLogo = async (companyName: string): Promise<string | null> => {
    const prompt = `A modern, flat, minimalist logo for a tech company named "${companyName}". Simple, clean icon with the company name. White background, vector style.`;
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: "image/png",
            },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating company logo:", error);
        return null; // Don't throw, as this is a non-critical feature
    }
};

/**
 * Generates a generic image from a prompt.
 */
export const generateGenericImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '4:3' = '1:1'): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: "image/png",
                aspectRatio,
            },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating generic image:", error);
        return null; // Don't throw, as this is a non-critical feature
    }
};

/**
 * Analyzes the skill gap between a user's profile and a job.
 */
export const analyzeSkillGapWithAI = async (userProfile: UserProfile, job: Job): Promise<SkillGapAnalysis> => {
  const prompt = `
    Analyze the skill gap between the user profile and the job description.
    User's skills: ${userProfile.skills.join(', ')}.
    Job required skills: ${job.skills.join(', ')}.
    Job description: ${job.description}.
    
    Return a JSON object with this schema:
    {
      "summary": "A one-sentence summary of the user's fit for the role.",
      "missingSkills": [
        {
          "skill": "The specific missing skill.",
          "recommendation": {
            "title": "A relevant, specific course, video, or article title for learning this skill.",
            "url": "A plausible example URL for the resource.",
            "type": "Course | Video | Article | Documentation"
          }
        }
      ]
    }

    Identify up to 3 most critical missing skills from the job's required skills list. For each, provide one high-quality learning resource recommendation.
    If there are no missing skills, return an empty array for "missingSkills" and a positive summary.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        const text = response.text.trim();
        return JSON.parse(text) as SkillGapAnalysis;
    } catch (error) {
        console.error("Error analyzing skill gap:", error);
        throw new Error("AI failed to analyze the skill gap.");
    }
};

/**
 * Generates a job description.
 */
export const generateJobDescriptionWithAI = async (
    title: string,
    skills: string[],
    companyName: string,
    companyDescription?: string
): Promise<string> => {
    const prompt = `
        Write a compelling and professional job description for a "${title}" position at ${companyName}.
        ${companyDescription ? `Here is a brief description of our company: ${companyDescription}` : ''}
        
        Key responsibilities should include tasks typical for this role.
        Required skills must include: ${skills.join(', ')}.
        
        Structure the description with the following sections using markdown:
        *   **About the Role:**
        *   **Key Responsibilities:** (use bullet points)
        *   **Qualifications:** (use bullet points)
        *   **About Us:** (if company description is provided)
        
        Make it sound engaging for potential candidates.
    `;
     try {
        const response = await ai.models.generateContent({ model: textModel, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating job description:", error);
        throw new Error("Failed to generate a job description with AI.");
    }
};

/**
 * Ranks applicants for a specific job.
 */
export const rankApplicantsWithAI = async (job: Job, applicants: UserProfile[]): Promise<ApplicantRanking[]> => {
    const jobInfo = `
        Job Title: ${job.title}
        Job Description: ${job.description}
        Required Skills: ${job.skills.join(', ')}
    `;

    const applicantsInfo = applicants.map(p => `
        ---
        Email: ${p.email}
        Summary: ${p.summary}
        Skills: ${p.skills.join(', ')}
        Experience: ${p.experience.map(e => `${e.role} at ${e.company}`).join(', ')}
    `).join('\n');

    const prompt = `
        Based on the job info below, rank the applicants from best to worst fit.
        Return a JSON array of objects, each with "email", "rank", and a brief "justification" for the ranking.
        The "rank" should be a number, starting from 1 for the best candidate.
        The "justification" should be a concise, one-sentence explanation.
        
        Job Info:
        ${jobInfo}
        
        Applicants:
        ${applicantsInfo}
    `;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            email: { type: Type.STRING },
                            rank: { type: Type.NUMBER },
                            justification: { type: Type.STRING }
                        },
                        required: ["email", "rank", "justification"]
                    }
                }
            },
        });
        const text = response.text.trim();
        const rankings = JSON.parse(text) as ApplicantRanking[];

        if (!Array.isArray(rankings)) {
            console.error("AI ranking response is not an array:", rankings);
            return [];
        }
        
        // The Gemini API may sometimes return numbers as strings in JSON.
        // We explicitly parse the rank to ensure it's a number for reliable sorting.
        return rankings.map(item => ({
            ...item,
            rank: Number(item.rank),
        }));
    } catch (error) {
        console.error("Error ranking applicants with AI:", error);
        throw new Error("AI failed to rank applicants.");
    }
};

/**
 * Provides feedback on a user's profile content.
 */
export const getProfileFeedbackWithAI = async (profile: UserProfile): Promise<ProfileFeedback> => {
    const prompt = `
        Act as a professional resume writing coach. Analyze the provided user profile JSON and give feedback.
        Return a JSON object with this schema:
        {
            "summary": { "feedback": "string", "suggestion": "string" },
            "experience": [{ "original": "string", "suggestion": "string" }]
        }

        For the summary, provide overall feedback and then a rewritten, more impactful suggestion.
        For each experience entry, provide a rewritten suggestion for the description. Focus on using strong action verbs and quantifying achievements where possible. Match the original description with its suggestion.
        
        User Profile:
        ${JSON.stringify(profile, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        const text = response.text.trim();
        return JSON.parse(text) as ProfileFeedback;
    } catch (error) {
        console.error("Error getting profile feedback with AI:", error);
        throw new Error("AI failed to provide profile feedback.");
    }
};

/**
 * Generates an auth poster image.
 */
export const generateAuthPoster = async (): Promise<string | null> => {
    const prompt = "A vibrant, abstract digital art illustration of interconnected nodes and glowing pathways, representing career networks and technology, in a professional dark theme with emerald green, teal, and slate gray colors. Minimalist and modern.";
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: "image/png",
                aspectRatio: '9:16',
            },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating auth poster:", error);
        return null; 
    }
};

/**
 * Rewrites a section of a resume using AI.
 */
export const improveResumeSectionWithAI = async (text: string, section: 'summary' | 'experience'): Promise<string> => {
    const prompt = `
        You are a professional resume writing expert.
        Rewrite the following resume ${section} to be more professional, impactful, and concise.
        Focus on using strong action verbs and quantifying achievements where possible.
        Return only the rewritten text, without any additional commentary.

        Original Text:
        ---
        ${text}
        ---
    `;
    try {
        const response = await ai.models.generateContent({ model: textModel, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error improving resume section:", error);
        throw new Error("AI failed to improve the text.");
    }
};

/**
 * Formats a user profile into a professional resume text.
 */
export const generateResumeContentWithAI = async (profile: UserProfile): Promise<string> => {
    const prompt = `
        You are a professional resume formatter.
        Convert the following user profile JSON into a clean, well-structured, professional resume format using plain text and markdown.
        
        - Start with the user's name, email, and phone number centered at the top.
        - Follow with a "Summary" section.
        - Then, a "Skills" section, listing skills in a comma-separated line.
        - Next, an "Experience" section. For each job, list the role, company, dates, and then the description as bullet points.
        - After that, include "Projects" and "Internships" sections if they exist, formatted similarly to Experience.
        - Finally, an "Education" section, listing undergraduate, 12th, and 10th standard details.
        
        Use markdown for headings (e.g., **Summary**) and bullet points (*).
        
        User Profile Data:
        ---
        ${JSON.stringify(profile, null, 2)}
        ---
    `;
    try {
        const response = await ai.models.generateContent({ model: textModel, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating resume content:", error);
        throw new Error("AI failed to generate the resume.");
    }
};

/**
 * Generates a value proposition for a fresher.
 */
export const generateValuePropositionWithAI = async (profile: UserProfile): Promise<string> => {
    const prompt = `
        Based on the following fresher's profile, write a compelling and concise one-paragraph "Value Proposition".
        This should be an "elevator pitch" highlighting their key strengths, technical skills, and potential contributions to a company.
        Focus on what makes them a strong entry-level candidate. Return only the generated paragraph, without any extra text or headings.

        Profile:
        - Skills: ${profile.skills.join(', ')}
        - Education: ${profile.education.undergraduate.degree} in ${profile.education.undergraduate.fieldOfStudy}
        - Projects: ${profile.projects.map(p => p.name).join(', ')}
        - Summary: ${profile.summary}
    `;
     try {
        const response = await ai.models.generateContent({ model: textModel, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating value proposition:", error);
        throw new Error("AI failed to generate a value proposition.");
    }
}

/**
 * Generates a preparation guide for a specific company and role.
 */
export const getCompanyPrepInfoWithAI = async (companyName: string, jobTitle: string): Promise<CompanyPrepInfo> => {
    const prompt = `
        Provide a comprehensive preparation guide for a "${jobTitle}" candidate interviewing at "${companyName}".
        Return a JSON object with the following schema:
        {
          "overview": "A brief, engaging overview of the company, its mission, and what it's known for.",
          "interviewQuestions": [
            "A technical question relevant to the role and company.",
            "A behavioral question relevant to the role.",
            "A question about the candidate's interest in this specific company."
          ],
          "latestNews": "A summary of one or two recent, positive news items or developments about the company. Frame it as something a candidate could mention in an interview."
        }
    `;
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overview: { type: Type.STRING },
                        interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING }},
                        latestNews: { type: Type.STRING }
                    },
                    required: ["overview", "interviewQuestions", "latestNews"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting company prep info:", error);
        throw new Error("AI failed to generate company preparation guide.");
    }
}