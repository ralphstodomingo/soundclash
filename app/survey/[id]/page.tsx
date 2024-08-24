"use client";

import logoSrc from "@/app/logo-white.png";
import { useEffect, useState } from "react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Type Definitions
type Question = {
  question: string;
  options?: string[];
  type?: "slider" | "radio";
  required?: boolean; // HERE
};

type QuestionsMap = Record<string, Question[]>;

export default function SurveyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleChange = (question: string, value: any) => {
    setFormData((prev) => ({ ...prev, [question]: value }));
  };

  const surveyTitles: Record<string, string> = {
    "5a827b3c-9d16-49ae-9ce2-bdabaf18b58d": "Mez Mauve VS Manu Miran",
    "be937b71-7db6-4b4e-8c86-9e706a307078":
      "Levy VS Shigecki / Umbra Abra VS Mapa Mota",
    "91c1eb0c-1741-47d8-9e5b-f5422a00a34a":
      "Levy VS Shigecki / Dukane VS Rivussy",
  };

  const personalInformationQuestions: Question[] = [
    {
      question: "First name",
      required: true,
    },
    {
      question: "Last name",
      required: true,
    },
    {
      question: "Phone number",
    },
    {
      question: "Email",
    },
    {
      question: "What is your Instagram or TikTok handle?",
    },
    {
      question: "Age",
    },
    {
      question: "Gender",
    },
    {
      question: "Occupation",
    },
    {
      question:
        "What are your musical preferences? Please describe or list the genres or favourite artists.",
    },
    {
      question: "On average, how many live events do you attend each month?",
      options: ["1 to 3", "3 to 5", "5 or more"],
    },
    {
      question: "On average, how many live events do you attend each month?",
      options: ["Yes", "No"],
    },
  ];

  const commonQuestions: Question[] = [
    {
      question:
        "How do you feel about changing the direction you face when a SOUNDCLASHER is playing?",
      options: ["Bad", "Neutral", "Good"],
    },
    {
      question:
        "How would you feel no longer able to attend any other SOUNDCLASH games in the future?",
      options: [
        "Very disappointed",
        "Somewhat disappointed",
        "Not disappointed",
      ],
    },
    {
      question:
        "What type of person do you think would enjoy attending SOUNDCLASH shows the most?",
    },
    {
      question: "How can we improve SOUNDCLASH to better meet your interests?",
    },
    {
      question:
        "How much would you pay to attend a SOUNDCLASH show like this one?",
    },
    { question: "Are there any DJs you recommend for SOUNDCLASH?" },
    {
      question:
        "Are there any DJs pairs you would recommend SOUNDCLASH to pit against each other?",
    },
    {
      question:
        "Are there any other comments or suggestions you'd like to make?",
    },
  ];

  const conditionalQuestions: QuestionsMap = {
    "5a827b3c-9d16-49ae-9ce2-bdabaf18b58d": [
      {
        question: "How did you find using the APP?",
        options: ["Easy", "Neutral", "Hard"],
      },
      // {
      //   question:
      //     "How did voting on which SOUNDCLASHER receives a Power Up using the APP affect your experience of a SOUNDCLASH?",
      //   type: "slider",
      //   options: [
      //     "It made my experience less enjoyable",
      //     "It would not affect my experience",
      //     "It made my experience more enjoyable",
      //   ],
      // },
      {
        question: "How do you feel about there being no winner announced?",
        options: [
          "It made my experience less enjoyable",
          "It would not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "Should there be a winner that is announced at the end of the game?",
        options: ["Yes", "No"],
      },
      {
        question: "How do you feel about the intermission length?",
        options: [
          "I did not like that there was an intermission",
          "Too Short",
          "Just Right",
          "Too Long",
        ],
      },
      {
        question: "How do you feel about the length of each turn?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question: "How do you feel about the overall length of the game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question: "How do you feel about the length of the overall event?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How would you feel if there were two games during the event?",
        options: [
          "It would make my experience less enjoyable",
          "It would not affect my experience",
          "It would make my experience more enjoyable",
        ],
      },
      {
        question: "How do you feel about the presenter's commentating?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"], // Assuming you want the scale as slider labels
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
    ],
    "be937b71-7db6-4b4e-8c86-9e706a307078": [
      {
        question:
          "Did you prefer the SOUNDCLASHER'S entrance when they walked in or when they suddenly appeared?",
        options: ["Walked in", "Suddenly Appeared"],
      },
      {
        question: "How did you find using the APP?",
        options: ["Easy", "Neutral", "Hard"],
      },
      {
        question:
          "How did voting for a winner in the first game using the APP affect your experience of a SOUNDCLASH?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about there being no winner announced in the second game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How would voting for a winner with your cheering instead of with an APP affect your experience of a SOUNDCLASH?",
        options: [
          "It would make my experience less enjoyable",
          "It would not affect my experience",
          "It would make my experience more enjoyable",
        ],
      },
      {
        question: "Should a SOUNDCLASH game have a winner?",
        options: ["Yes", "No"],
      },
      {
        question: "How do you feel about the transition between the two games?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the length of each turn in the first game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question: "How do you feel about the overall length of the first game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the length of each turn in the second game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the overall length of the second game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the intermission length in the second game?",
        options: [
          "I did not like that there was an intermission",
          "Too Short",
          "Just Right",
          "Too Long",
        ],
      },
      {
        question:
          "How do you feel about experiencing two games of different lengths in the same event?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question: "How do you feel about the length of the overall event?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the voiceover's commentating during the second game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "How do you feel about watching SOUNDCLASHERS being interviewed after the game ends?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
    ],
    "91c1eb0c-1741-47d8-9e5b-f5422a00a34a": [
      {
        question:
          "Did you prefer the SOUNDCLASHER'S entrance when they walked in or when they suddenly appeared?",
        options: ["Walked in", "Suddenly Appeared"],
      },
      {
        question:
          "How did voting for a winner based on yours and the crowd's reaction affect your experience of a SOUNDCLASH?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about voting for a winner at the end of a game using a mobile APP?",
        options: [
          "It would make my experience less enjoyable",
          "It would not affect my experience",
          "It would make my experience more enjoyable",
        ],
      },
      {
        question: "Should a SOUNDCLASH game have a winner?",
        options: ["Yes", "No"],
      },
      {
        question: "How do you feel about the transition between the two games?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the length of each turn in the first game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question: "How do you feel about the overall length of the first game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the shortening of the length of turns in the second game, compared to the fixed length turns in the first game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about the overall length of the second game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about experiencing two games of different lengths in the same event?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about there being a voiceover in the first game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about there being a presenter in the second game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question: "Do you prefer there being a voiceover or a presenter?",
        options: ["Voiceover", "Presenter"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "How do you feel about watching SOUNDCLASHERS being interviewed after a game ends?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question: "How do you feel about the length of the overall event?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about voting for a winner at the end of a game using a mobile APP?",
        options: [
          "It would make my experience less enjoyable",
          "It would not affect my experience",
          "It would make my experience more enjoyable",
        ],
      },
    ],
  };
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    const checkRequiredFields = () => {
      const allFieldsFilled = [
        ...personalInformationQuestions,
        ...commonQuestions,
        ...(conditionalQuestions[params.id] || []),
      ].every(
        (item) =>
          !item.required ||
          (formData[item.question] && formData[item.question].trim() !== "")
      );

      setIsSubmitDisabled(!allFieldsFilled);
    };

    checkRequiredFields();
  }, [formData, params.id]);

  const handleSubmit = async () => {
    setIsLoading(true);
    let combinedQuestions = [
      ...personalInformationQuestions,
      ...commonQuestions,
    ];

    if (params.id in conditionalQuestions) {
      combinedQuestions = [
        ...combinedQuestions,
        ...conditionalQuestions[params.id],
      ];
    }

    const combinedData = combinedQuestions.map((item) => ({
      question: item.question,
      answer: formData[item.question] || "",
    }));

    const { data, error } = await supabase.from("survey_submissions").insert([
      {
        event_id: params.id,
        submission: combinedData,
      },
    ]);

    if (error) {
      console.error("Error inserting survey submission:", error);
    } else {
      router.push("/thank-you");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between bg-black max-w-[600px] mx-auto p-8 dark">
      {/* Logo at the Top */}
      <div className="w-full">
        <Image
          className="w-full max-h-48 object-cover rounded-md mb-4 filter-invert"
          src={logoSrc}
          alt="Soundclash"
        />
      </div>
      <div className="w-full">
        <h1 className="text-2xl text-black dark:text-white font-bold mb-4">
          Survey - {surveyTitles[params.id] ?? "Unknown Event"}
        </h1>
        <p className="text-black dark:text-white mb-6 text-md">
          Please fill out this quick survey about your experience at SOUNDCLASH.
        </p>
      </div>
      {page === 1 && (
        <div className="space-y-6 mb-8">
          <h2 className="text-xl text-black dark:text-white font-bold mb-4">
            Personal Information
          </h2>
          {personalInformationQuestions.map((item, index) => (
            <div key={index}>
              <p className="text-black dark:text-white mb-2 font-medium">
                {item.question}{" "}
                {item.required && <span className="text-red-500">*</span>}
              </p>
              <Input
                className="bg-white text-black"
                placeholder="Type your answer here..."
                onChange={(e) => handleChange(item.question, e.target.value)}
              />
            </div>
          ))}
          <Button onClick={() => setPage(2)}>Next</Button>
        </div>
      )}
      {page === 2 && (
        <div className="space-y-6">
          {/* Common Questions */}
          <h2 className="text-xl text-black dark:text-white font-bold mb-4">
            General questions
          </h2>
          {commonQuestions.map((item, index) => (
            <div key={index}>
              <p className="text-black dark:text-white mb-2 font-medium">
                {item.question}
              </p>
              {item.options ? (
                <RadioGroup
                  name={item.question}
                  onValueChange={(value) => handleChange(item.question, value)}
                >
                  {item.options.map((option, optionIndex) => (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option}
                        id={`r${index}-${optionIndex}`}
                        key={`r${index}-${optionIndex}`}
                      />
                      <Label htmlFor={`r${index}-${optionIndex}`} className="text-white">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  className=" bg-white"
                  placeholder="Type your answer here..."
                  onChange={(e) => handleChange(item.question, e.target.value)}
                />
              )}
            </div>
          ))}

          {/* Conditional Questions based on ID */}
          <h2 className="text-xl text-black dark:text-white font-bold mb-4">
            Event questions
          </h2>
          {params.id &&
            conditionalQuestions[params.id]?.map((item, index) => (
              <div key={index}>
                <p className="text-black dark:text-white mb-2 font-medium">
                  {item.question}
                </p>

                {item.options && (
                  <RadioGroup
                    name={item.question}
                    onValueChange={(value) =>
                      handleChange(item.question, value)
                    }
                  >
                    {item.options.map((option, optionIndex) => (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`r${index}-${optionIndex}`}
                          key={`r${index}-${optionIndex}`}
                        />
                        <Label htmlFor={`r${index}-${optionIndex}`} className="text-white">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
          <div className="flex justify-between">
            <Button onClick={() => setPage(1)}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled || isLoading}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
