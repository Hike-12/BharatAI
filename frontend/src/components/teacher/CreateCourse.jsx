import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../../context/ThemeContext";

const categories = [
  "Mathematics",
  "Science",
  "History",
  "Literature",
  "Computer Science",
  "Engineering",
  "Medicine",
  "Other",
];

const languages = [
  "English",
  "Hindi",
  "Marathi",
  "Kannada",
  "Bengali",
  "Tamil",
  "Telugu",
  "Gujarati",
];

const CreateCourse = ({ setActiveTab }) => {
  const { isDark } = useTheme();
  const [user] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    language: "English",
    isPrivate: false,
    password: "",
    tags: [],
    estimatedTime: 60,
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const navigate = useNavigate();

  // Sidebar nav items (consistent with dashboard)
  const navItems = [
    { key: "overview", label: "Overview" },
    { key: "courses", label: "Courses" },
    { key: "analytics", label: "Analytics" },
  ];

  // PDF upload handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setPdfFile(file);
    }
  };

  // Tag add/remove
  const addTag = () => {
    if (tagInput.trim() && !courseData.tags.includes(tagInput.trim())) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };
  const removeTag = (tagToRemove) => {
    setCourseData({
      ...courseData,
      tags: courseData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Stepper navigation
  const handleNext = () => {
    if (step === 1) {
      if (
        !courseData.title ||
        !courseData.description ||
        !courseData.category
      ) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (step === 2) {
      if (!pdfFile) {
        toast.error("Please upload a PDF file");
        return;
      }
    } else if (step === 3 && courseData.isPrivate && !courseData.password) {
      toast.error("Password is required for private courses");
      return;
    }
    setStep(step + 1);
  };
  const handlePrev = () => setStep(step - 1);

  // Submit handler (backend-aligned)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("category", courseData.category);
      formData.append("language", courseData.language);
      formData.append("isPrivate", courseData.isPrivate);
      if (courseData.isPrivate)
        formData.append("password", courseData.password);
      formData.append("tags", JSON.stringify(courseData.tags));
      formData.append("pdf", pdfFile);
      formData.append("estimatedTime", courseData.estimatedTime);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.course && data.course.courseCode) {
          setCourseCode(data.course.courseCode);
          toast.success(
            `Course created! Your course code is: ${data.course.courseCode}`,
            { autoClose: 6000 }
          );
        } else {
          toast.success("Course created successfully!");
        }
        setTimeout(() => {
          setActiveTab("courses");
        }, 500);
      } else {
        toast.error(data.message || "Failed to create course");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Stepper UI
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3
                className={`text-2xl font-semibold mb-2 ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Course Information
              </h3>
              <p className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                Provide basic details about your course
              </p>
            </div>
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Course Title *
              </label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) =>
                  setCourseData({ ...courseData, title: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200
                  ${
                    isDark
                      ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                      : "bg-[#f8f8f8] text-[#080808] border-[#e5e7eb]"
                  }`}
                placeholder="Enter course title"
                required
              />
            </div>
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Description *
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) =>
                  setCourseData({ ...courseData, description: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 h-32 resize-none
                  ${
                    isDark
                      ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                      : "bg-[#f8f8f8] text-[#080808] border-[#e5e7eb]"
                  }`}
                placeholder="Describe your course content and objectives"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  Category *
                </label>
                <select
                  value={courseData.category}
                  onChange={(e) =>
                    setCourseData({ ...courseData, category: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200
                    ${
                      isDark
                        ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                        : "bg-[#f8f8f8] text-[#080808] border-[#e5e7eb]"
                    }`}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  Language
                </label>
                <select
                  value={courseData.language}
                  onChange={(e) =>
                    setCourseData({ ...courseData, language: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200
                    ${
                      isDark
                        ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                        : "bg-[#f8f8f8] text-[#080808] border-[#e5e7eb]"
                    }`}
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Tags (Optional)
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                    ${
                      isDark
                        ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                        : "bg-[#f8f8f8] text-[#080808] border-[#e5e7eb]"
                    }`}
                  placeholder="Add relevant tags"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      isDark
                        ? "bg-[#23234a] text-[#a78bfa] hover:bg-[#18182b]"
                        : "bg-[#ece9ff] text-[#7c3aed] hover:bg-[#e0e7ff]"
                    }`}
                >
                  Add
                </button>
              </div>
              {courseData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {courseData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm flex items-center space-x-2
                        ${
                          isDark
                            ? "bg-[#23234a] text-[#a78bfa]"
                            : "bg-[#ece9ff] text-[#7c3aed]"
                        }`}
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className={`ml-2 hover:text-red-400
                          ${isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"}
                        `}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label
                className={`block mb-2 text-sm font-medium ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Estimated Time (minutes) *
              </label>
              <input
                type="number"
                min="15"
                max="600"
                value={courseData.estimatedTime}
                onChange={(e) =>
                  setCourseData({
                    ...courseData,
                    estimatedTime: parseInt(e.target.value) || "",
                  })
                }
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200
                  ${
                    isDark
                      ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                      : "bg-[#f8f8f8] text-[#080808] border-[#e5e7eb]"
                  }`}
                placeholder="60"
                required
              />
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-[#aaa]" : "text-[#222]"
                }`}
              >
                How long should this course take to complete?
              </p>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3
                className={`text-2xl font-semibold mb-2 ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Upload Course Material
              </h3>
              <p className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                Upload your course content as a PDF document
              </p>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${
                isDark
                  ? "border-[#7c3aed]/30 hover:border-[#a78bfa]/50"
                  : "border-[#7c3aed]/30 hover:border-[#7c3aed]/50"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="mb-4">
                  <svg
                    className={`w-12 h-12 mx-auto ${
                      isDark ? "text-[#a78bfa]/40" : "text-[#7c3aed]/40"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                {pdfFile ? (
                  <div className="space-y-2">
                    <p
                      className={`font-medium ${
                        isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                      }`}
                    >
                      {pdfFile.name}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-[#aaa]" : "text-[#222]"
                      }`}
                    >
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      File ready for upload
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p
                      className={`font-medium ${
                        isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                      }`}
                    >
                      Click to upload PDF file
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-[#aaa]" : "text-[#222]"
                      }`}
                    >
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3
                className={`text-2xl font-semibold mb-2 ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Privacy & Access Settings
              </h3>
              <p className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                Configure who can access your course
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="private-course"
                  checked={courseData.isPrivate}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      isPrivate: e.target.checked,
                      password: "",
                    })
                  }
                  className={`w-5 h-5 rounded focus:ring-blue-500 mt-0.5
                    ${
                      isDark
                        ? "text-blue-400 bg-[#080808] border-[#23234a]"
                        : "text-blue-600 bg-[#f8f8f8] border-[#e5e7eb]"
                    }`}
                />
                <div>
                  <label
                    htmlFor="private-course"
                    className={`font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    Make this course private
                  </label>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-[#aaa]" : "text-[#222]"
                    }`}
                  >
                    Private courses require a password for students to enroll
                    and generate a unique course code.
                  </p>
                </div>
              </div>
              {courseData.isPrivate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="ml-8 space-y-3"
                >
                  <div>
                    <label
                      className={`block mb-2 text-sm font-medium ${
                        isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                      }`}
                    >
                      Course Password *
                    </label>
                    <input
                      type="password"
                      value={courseData.password}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          password: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200
                        ${
                          isDark
                            ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                            : "bg-[#f8f8f8] text-[#080808] border-[#e5e7eb]"
                        }`}
                      placeholder="Enter a secure password"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3
                className={`text-2xl font-semibold mb-2 ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Review & Submit
              </h3>
              <p className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                Please review your course details before submitting.
              </p>
            </div>
            <div
              className={`rounded-lg p-6 border
              ${
                isDark
                  ? "bg-[#080808] border-[#23234a]"
                  : "bg-[#f8f8f8] border-[#e5e7eb]"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                    Title:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    {courseData.title || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                    Category:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    {courseData.category || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                    Language:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    {courseData.language}
                  </p>
                </div>
                <div>
                  <span className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                    Access:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    {courseData.isPrivate ? "Private" : "Public"}
                  </p>
                </div>
                <div>
                  <span className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                    File:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    {pdfFile?.name || "No file selected"}
                  </p>
                </div>
                <div>
                  <span className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                    Tags:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    {courseData.tags.length > 0
                      ? courseData.tags.join(", ")
                      : "None"}
                  </p>
                </div>
                <div>
                  <span className={isDark ? "text-[#aaa]" : "text-[#222]"}>
                    Estimated Time:
                  </span>
                  <p
                    className={`font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    {courseData.estimatedTime} minutes
                  </p>
                </div>
              </div>
            </div>
            {courseCode && (
              <div
                className={`rounded-lg p-4 text-center font-semibold
                ${
                  isDark
                    ? "bg-green-900 text-green-200"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Your course code:{" "}
                <span className="font-mono">{courseCode}</span>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Stepper progress bar
  const renderStepper = () => (
    <div className="flex items-center space-x-2 mb-8">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="flex items-center flex-1">
          <div
            className={`h-2 rounded-full flex-1 ${
              step >= num
                ? "bg-blue-600"
                : isDark
                ? "bg-[#23234a]"
                : "bg-[#e5e7eb]"
            }`}
          />
          {num < 4 && <div className="w-2" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1
          className={`text-3xl font-bold ${
            isDark ? "text-[#f8f8f8]" : "text-[#080808]"
          }`}
        >
          Create New Course
        </h1>
        <span className={isDark ? "text-[#aaa]" : "text-[#222]"}>
          Step {step} of 4
        </span>
      </div>
      {renderStepper()}
      <div
        className={`rounded-lg p-6 md:p-8 shadow-lg border
        ${
          isDark
            ? "bg-[#181818] border-[#23234a]"
            : "bg-[#f8f8f8] border-[#e5e7eb]"
        }`}
      >
        {renderStep()}
        {/* Navigation Buttons */}
        <div
          className={`flex justify-between items-center mt-8 pt-6 border-t
          ${isDark ? "border-[#23234a]" : "border-[#e5e7eb]"}
        `}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className={`px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
              ${
                isDark
                  ? "bg-[#23234a] text-[#a78bfa] hover:bg-[#18182b]"
                  : "bg-[#ece9ff] text-[#7c3aed] hover:bg-[#e0e7ff]"
              }`}
          >
            Previous
          </motion.button>
          {step < 4 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-700"
            >
              Next Step
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 transition-all duration-200 hover:bg-green-700"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating Course...</span>
                </div>
              ) : (
                "Create Course"
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
