export const extractionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          source: { type: "string" },
          stage: {
            type: "string",
            enum: ["初筛", "沟通中", "待面试", "已面试", "待Offer", "已入职", "已淘汰"],
          },
          owner: { type: "string" },
          interviewTime: { type: "string" },
          lastContact: { type: "string" },
          risk: { type: "string" },
          summary: { type: "string" },
          confidence: { type: "number" },
        },
        required: [
          "name",
          "role",
          "source",
          "stage",
          "owner",
          "interviewTime",
          "lastContact",
          "risk",
          "summary",
          "confidence",
        ],
      },
    },
  },
  required: ["candidates"],
} as const;
