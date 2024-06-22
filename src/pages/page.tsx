"use client";
import { Container } from "@chakra-ui/react";
import { useState } from "react";

export default function FileUploadForm() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    try {
      const res = await fetch("/api/uploadFile/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Upload result:", data);
      // Handle the response (e.g., show success message, update UI)
    } catch (error) {
      console.error("Error uploading file on server:", error);
      // Handle the error (e.g., show error message)
    }
  };

  return (
    <Container >
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="application/pdf" />
        <button type="submit">Upload</button>
      </form>
    </Container>
  );
}
