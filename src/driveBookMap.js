/**
 * Google Drive file ID map for Sunstone Library books.
 * Folder: https://drive.google.com/drive/folders/1X3TW3UsovWcVreCbFoTBLI0diZ3MmYTa
 */
export const PRAYAS_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1X3TW3UsovWcVreCbFoTBLI0diZ3MmYTa?usp=drive_link';

export const DRIVE_SUBFOLDERS = {
  aws: '1ku_jd_e9s7ePbrJf3tu_BZ1n1KSR8Zih',
  azure: '1aSeJQwvXCJcq-BQmxzCuE8wakCzTRcop',
  Devops: '1ujaK_nwJoH1m1pLfXnIUnUNgCOsRYjly',
  python: '1yLW56fKc2UEHeyB1wGPhrpg8CCgbTLZw'
};

/** filename (case-insensitive) -> Google Drive file ID */
export const DRIVE_FILE_IDS = {
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

export function normalizeBookFilename(name) {
  return String(name || '').trim().toLowerCase();
}

export function getDriveFileIdForFilename(filename) {
  const key = normalizeBookFilename(filename);
  return DRIVE_FILE_IDS[key] || null;
}

export function getDriveShareUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}

export function getDrivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
