import cv2
import numpy as np
from imutils.perspective import four_point_transform


def load_image(imgPath):
    img = cv2.imread(imgPath)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img, gray


def getContours(img):
    blurred = cv2.GaussianBlur(img, (5, 5), 0)
    edges = cv2.Canny(blurred, 30, 100)
    kernel = np.ones((2, 2), np.uint8)
    dilate = cv2.dilate(edges, kernel, iterations=1)
    edges = dilate
    #getting contours
    contours, hierarchy = cv2.findContours(edges, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key = cv2.contourArea, reverse = True)
    # remove contours that are too small or too large
    contours = [cnt for cnt in contours if 1000<cv2.contourArea(cnt)<200000]
    rec_Contours = []
    if len(contours) > 0:
        for i in range(2):
            arcLength = cv2.arcLength(contours[i], True)
            approx = cv2.approxPolyDP(contours[i], 0.02 * arcLength, True)
            if len(approx) == 4:
                rec_Contours.append(approx)


    return rec_Contours, img

def cropPaper(img, gray, contours):
    paperBlocks = []
    warpedPapers = []
    for c in contours:
        paperBlocks.append(four_point_transform(img, c.reshape(4, 2)))
        warpedPapers.append(four_point_transform(gray, c.reshape(4, 2)))
    
    return paperBlocks, warpedPapers


def getThresholdedImage(warped_Papers):
    opened = []
    for paperBlock in warped_Papers:
        thresholded = cv2.adaptiveThreshold(paperBlock, 255,
                                cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 35, 5)
        #removing top 25 rows to get rid of option letters A, B, C, D, E
        thresholded = thresholded[26:]
        thresholded = cv2.resize(thresholded, (215, 750))
        kernel = np.ones((5, 5), dtype = np.uint8)
        eroded = cv2.erode(thresholded, kernel, iterations = 3)
        dilated = cv2.dilate(eroded, kernel, iterations = 2)
        opened.append(dilated)
    
    return opened


def splitBoxes(image, questions = 25, options = 5):
    boxes = []
    rows = np.vsplit(image, questions)
    for r in rows:
        cols = np.hsplit(r, options)
        for c in cols:
            boxes.append(c)

    return boxes
def countPixelsinBoxes(boxes, questions = 25, options = 5):
    pixelValues = np.zeros((questions, options), dtype = np.int32)
    row, col = 0, 0
    for box in boxes:
        pixels = cv2.countNonZero(box)
        pixelValues[row][col] = pixels
        col += 1
        if col == options:
            col = 0
            row += 1
    
    return pixelValues

def getChoices(pixelValues):
    choices = {}
    for i in range(len(pixelValues)):
        threshold = 100
        #getting indexes where values >= threshold
        indexes = np.where(pixelValues[i] >= threshold)[0]
        if indexes.size == 1:
            option = ''
            if indexes[0] == 0:
                option = 'A'
            elif indexes[0] == 1:
                option = 'B'
            elif indexes[0] == 2:
                option = 'C'
            elif indexes[0] == 3:
                option = 'D'
            elif indexes[0] == 4:
                option = 'E'
            choices[i + 1] = option
        else:
            choices[i + 1] = 'UnMarked'
            
    return choices

# answers = {
#     1: 'B', 2: 'C', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'C', 8: 'D', 9: 'C', 10: 'C',
#     11: 'D', 12: 'D', 13: 'E', 14: 'D', 15: 'C', 16: 'B', 17: 'C', 18: 'A', 19: 'B', 20: 'C',
#     21: 'D', 22: 'B', 23: 'C', 24: 'E', 25: 'B', 26: 'E', 27: 'E', 28: 'A', 29: 'B', 30: 'C',
#     31: 'D', 32: 'E', 33: 'A', 34: 'B', 35: 'C', 36: 'D', 37: 'D', 38: 'C', 39: 'B', 40: 'A',
# }
def getScores(answers, choices):
    score = 0
    for key, value in choices.items():
        correct_answer = answers[key]
        if correct_answer == value:
            score += 1
        else:
            # print('Question ', key, ' is wrong. Correct answer is ', correct_answer, ' but your answer is ', value)
            pass
            
    return score



def OMR(imgpath):
    #Main Function
    img, gray = load_image(imgpath)
    #contours
    contours, image = getContours(img)
    contour_image = image.copy()
    cv2.drawContours(contour_image, contours, -1, (255, 0, 0), 3)

    #warped
    paperBlocks, warpedPapers = cropPaper(image, gray, contours)


    #thresholded
    opened = getThresholdedImage(warpedPapers)

    #Counting Pixels and getting choices
    boxes = splitBoxes(opened[0], questions = 25)
    boxes.extend(splitBoxes(opened[1], questions = 15))
    pixelValues = countPixelsinBoxes(boxes, questions = 40)
    choices = getChoices(pixelValues)
    
    return choices