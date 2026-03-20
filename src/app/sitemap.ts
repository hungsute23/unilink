import { MetadataRoute } from 'next';
import { getAllSchools, getAllScholarships, getAllJobs } from '@/lib/appwrite/queries/public.queries';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://unilink-taiwan.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [schools, scholarships, jobs] = await Promise.all([
    getAllSchools(),
    getAllScholarships(),
    getAllJobs(),
  ]);

  const schoolEntries: MetadataRoute.Sitemap = schools.map((school) => ({
    url: `${BASE_URL}/schools/${school.$id}`,
    lastModified: school.$updatedAt ? new Date(school.$updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const scholarshipEntries: MetadataRoute.Sitemap = scholarships.map((scholarship) => ({
    url: `${BASE_URL}/scholarships/${scholarship.$id}`,
    lastModified: scholarship.$updatedAt ? new Date(scholarship.$updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.$id}`,
    lastModified: job.$updatedAt ? new Date(job.$updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/schools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/scholarships`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...schoolEntries,
    ...scholarshipEntries,
    ...jobEntries,
  ];
}
