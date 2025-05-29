import { Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { ParseResult } from '../types/resume';

interface ParsedResultsProps {
  result: ParseResult;
  onDownload: () => void;
}

export function ParsedResults({ result, onDownload }: ParsedResultsProps) {
  if (!result.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <XCircle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-red-800">Parsing Failed</h3>
        </div>
        <p className="text-red-700">{result.error}</p>
        <div className="mt-4 text-sm text-red-600">
          <p>Method: {result.method.toUpperCase()}</p>
          <p>Processing time: {result.processingTime}ms</p>
        </div>
      </div>
    );
  }

  const { data } = result;
  if (!data) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Resume Parsed Successfully</h3>
          </div>
          <button
            onClick={onDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download JSON</span>
          </button>
        </div>
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{result.processingTime}ms</span>
          </div>
          <span>•</span>
          <span>Method: {result.method.toUpperCase()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Contact Information */}
        {data.contact && (
          <section>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Contact Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.contact.name && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <p className="text-sm text-gray-900">{data.contact.name}</p>
                </div>
              )}
              {data.contact.email && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-sm text-gray-900">{data.contact.email}</p>
                </div>
              )}
              {data.contact.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Phone:</span>
                  <p className="text-sm text-gray-900">{data.contact.phone}</p>
                </div>
              )}
              {data.contact.location && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Location:</span>
                  <p className="text-sm text-gray-900">{data.contact.location}</p>
                </div>
              )}
              {data.contact.linkedin && (
                <div>
                  <span className="text-sm font-medium text-gray-600">LinkedIn:</span>
                  <p className="text-sm text-gray-900">{data.contact.linkedin}</p>
                </div>
              )}
              {data.contact.github && (
                <div>
                  <span className="text-sm font-medium text-gray-600">GitHub:</span>
                  <p className="text-sm text-gray-900">{data.contact.github}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Summary */}
        {data.summary && (
          <section>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Summary</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900">{data.summary}</p>
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Experience</h4>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">{exp.position}</h5>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {exp.startDate && exp.endDate && (
                        <p>{exp.startDate} - {exp.endDate}</p>
                      )}
                      {exp.location && <p>{exp.location}</p>}
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.description.map((desc, descIndex) => (
                        <li key={descIndex} className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Education</h4>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">{edu.degree}</h5>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {edu.startDate && edu.endDate && (
                        <p>{edu.startDate} - {edu.endDate}</p>
                      )}
                      {edu.gpa && <p>GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Skills</h4>
            <div className="space-y-3">
              {data.skills.map((skillGroup, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{skillGroup.category}</h5>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Projects</h4>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900">{project.name}</h5>
                  {project.description && (
                    <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Raw JSON Preview */}
        <section>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Raw JSON Data</h4>
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
            <pre className="text-sm text-green-400">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
} 