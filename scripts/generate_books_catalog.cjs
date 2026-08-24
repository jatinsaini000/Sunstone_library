/**
 * Generates book catalog from local PDFs + Google Drive links.
 * Usage: node scripts/generate_books_catalog.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const uploadsDir = path.join(ROOT, 'uploads', 'books');
const srcBooksDir = path.join(ROOT, 'src', 'books');
const dataStorePath = path.join(ROOT, 'data_store.json');
const catalogOutPath = path.join(ROOT, 'src', 'booksCatalog.js');

const DRIVE_FILE_IDS = {
  'automating.devops.with.gitlab.ci.cd.pipelines.pdf': '1QB2Agk81OfkaSdCONIs79hblJdfCQ-5i',
  'aws interview.pdf': '1WE8QeRaMdP8-x_oGOPPfpos-YPxxrVsp',
  'aws learning roadmap.pdf': '1I33gFhoGKoaxlzR_EFLaqNrp_lAgBbms',
  'aws_basic_interview_questions_clouddost_telegram.pdf': '1QH-Pqo4QYV7wQzbeApFPPsk666_ViiXa',
  'aws_cerified_cloud_practitioner.pdf': '1NyCILEZJJyI1ZAWLAWv2vW_xvRigqFVJ',
  'aws_certified_solutions_architect.pdf': '1-etkJ3A6ge0pLmR7noasgxV5YcetMFkj',
  'aws_cookbook_recipes_for_success_on_aws_john_culkin,_mike_zazon.pdf': '1HhhlzX3Rf4JfeisTHKvfhGZIMdKsiYmm',
  'aws_vs_azure_vs_google_vs_ibm_vs_oracle_vs_alibaba_a_detailed_comparison.pdf': '1-dtUGQrdAhJBdnSIiy1YVn4xFClPFrYB',
  'azure devops engineer.pdf': '1kUWAeAm_cA4QY1Ocjln1FHwtHtNMDkAM',
  'azure full course.pdf': '1adc8cT3NHxjxizJKLTxeALa4LfW_inyT',
  'azure&aws_cloudservicemap.pdf': '1zsrDzSx2OxS3DlfNWA8s6WnhwViLV73Q',
  'azurecertpath.pdf': '1t8aikLSY8PHv2QTpdRyGSquEFO9cEr2R',
  'azuredevops.pdf': '1OmSIzH8GjgRLqkAXaE8oMLEAMDl0XYM5',
  'a_practical_guide_to_azure_devops_learn_by_doing.pdf': '1IECq9jvN7zeVQb2fy07RLnTzfzn04v7D',
  'devops for dummies.pdf': '1IrKluFzsnaQgQXmEsw5dEGoXf2aRoWD8',
  'devops_1695290060.pdf': '1U0ZfGUakFFz4uCddiDT1hA1afNOhqXIt',
  'devops_1695548180.pdf': '1lpcBuqnEtSxbo_KvFtGn7wQixE3d_Ds-',
  'devops_1696088085.pdf': '1sx1PXRHNhMTLSxDXumXd-TNH6qckYSvJ',
  'devops_1696443361.pdf': '1ihpMjn_edxn7h1kZCcMWCl4YmZe1GWJU',
  'devops_200_interview_questions_1692564411.pdf': '1R5WRVCFOPJcxdHkG8jDob_w94hGj6y7j',
  'devops_culture_and_practice_with_openshift_deliver_continuous_business.pdf': '1vnDvOp2XUrb_rpIPo7W9m9vzbq3pP7Yt',
  'devops_interview_questions_answers_1695746349.pdf': '1IHLTV42Qi__mQBWgB72YNDgZSE3pCra3',
  'migrating_to_aws_a_manager\'s_guide_how_to_foster_agility,_reduce.pdf': '1WRYnnao8bv9RJxqUJ38yoIE6n4oBOiLZ',
  'mobile.devops.playbook.pdf': '1eeWvARqaaRG9cCXFuLHwzzZgpFXx1gfK',
  'serverless_applications_with_node.pdf': '1JmG3Sz4VHIRTthvczL7fVmmoTgcc1WM4',
  'serverless_architecture_on_aws_peter.pdf': '1q07OnOaK0K5Uk81_PW9SZRIRnt1FSB4g',
  'serverless_architectures_on_aws_peter_sbarski,_yan_cui,_ajay_nair.pdf': '19s4DpoNoMeOxYyDs5A_Yl3uxaJOwW0iA'
};

const CATEGORY_META = {
  aws: { program: 'Special Collections', category: 'AWS Cloud', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
  azure: { program: 'Special Collections', category: 'Azure Cloud', cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80' },
  Devops: { program: 'B.Tech CS', category: 'DevOps', cover: 'https://images.unsplash.com/photo-1618477388954-7852f62635c5?auto=format&fit=crop&w=600&q=80' },
  python: { program: 'B.Tech CS', category: 'Python Programming', cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80' }
};

function normalize(name) {
  return String(name || '').trim().toLowerCase();
}

function titleFromFilename(filename) {
  return filename.replace(/\.pdf$/i, '').replace(/_/g, ' ');
}

function resolvePdfUrl(filename) {
  const driveId = DRIVE_FILE_IDS[normalize(filename)];
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
  }
  return `/uploads/books/${filename}`;
}

function collectPdfFiles() {
  const files = new Map();

  function addFromDir(dir, category) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
        files.set(entry.name, { filename: entry.name, category: category || 'General' });
      }
    }
  }

  if (fs.existsSync(srcBooksDir)) {
    for (const folder of fs.readdirSync(srcBooksDir, { withFileTypes: true })) {
      if (folder.isDirectory()) addFromDir(path.join(srcBooksDir, folder.name), folder.name);
    }
  }

  addFromDir(uploadsDir, null);

  return [...files.values()].sort((a, b) => a.filename.localeCompare(b.filename));
}

function buildBook(entry, index) {
  const { filename, category } = entry;
  const meta = CATEGORY_META[category] || { program: 'All Programs', category: 'Technical', cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=600&q=80' };
  const title = titleFromFilename(filename);
  const driveId = DRIVE_FILE_IDS[normalize(filename)];
  const pdfUrl = resolvePdfUrl(filename);

  return {
    id: `bk_${category ? category.toLowerCase() : 'tech'}_${index + 1}`,
    title,
    author: 'Sunstone Library',
    program: meta.program,
    category: meta.category,
    coverUrl: meta.cover,
    fileType: driveId ? 'drive' : 'file',
    pdfUrl,
    driveFileId: driveId || null,
    localPath: `/uploads/books/${filename}`,
    downloadable: true,
    rating: 4.8,
    pages: 350,
    publishedYear: 2024,
    quickSummary: {
      highlights: ['Comprehensive technical material.', 'Practical examples and case studies.', 'Industry standard practices.'],
      keyTakeaways: ['Master core technical concepts.', 'Apply learning to real-world projects.'],
      estimatedReadingTime: '12 Hours',
      difficultyLevel: 'Intermediate to Advanced'
    },
    description: `A comprehensive technical guide: ${title}. Available via Google Drive and local library storage.`
  };
}

const pdfFiles = collectPdfFiles();
const books = pdfFiles.map((entry, i) => buildBook(entry, i));

// Write booksCatalog.js
const catalogJs = `/** Auto-generated by scripts/generate_books_catalog.cjs — do not edit manually */\nexport const catalogBooks = ${JSON.stringify(books, null, 2)};\n\nexport default catalogBooks;\n`;
fs.writeFileSync(catalogOutPath, catalogJs, 'utf8');

// Update data_store.json books while preserving users/requests
let dataStore = { users: [], books: [], borrowRequests: [], userNotes: [] };
if (fs.existsSync(dataStorePath)) {
  dataStore = JSON.parse(fs.readFileSync(dataStorePath, 'utf8'));
}
dataStore.books = books;
fs.writeFileSync(dataStorePath, JSON.stringify(dataStore, null, 2), 'utf8');

console.log(`Generated ${books.length} books`);
console.log(`  Google Drive links: ${books.filter((b) => b.fileType === 'drive').length}`);
console.log(`  Local fallback: ${books.filter((b) => b.fileType === 'file').length}`);
console.log('Updated:', catalogOutPath);
console.log('Updated:', dataStorePath);
