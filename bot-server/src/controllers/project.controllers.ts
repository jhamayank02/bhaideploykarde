import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getProject(req: Request, res: Response) {
    const project_id = Array.isArray(req.query.project_id) ? req.query.project_id[0] : req.query.project_id;
    const build_id = Array.isArray(req.query.build_id) ? req.query.build_id[0] : req.query.build_id;
    if (!project_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            error: "Invalid project_id"
        });
    }
    if (!build_id || isNaN(Number(build_id))) {
        return res.status(400).json({
            status: 400,
            success: false,
            error: "Invalid build_id"
        });
    }

    const project = await prisma.project.findFirst({
        where: {
            project_id: project_id
        }
    });
    if (!project) {
        return res.status(404).json({
            status: 404,
            success: false,
            error: "Project not found"
        });
    }

    const deployment = await prisma.deployment.findUnique({
        where: {
            id: Number(build_id)
        }
    });
    if (!deployment) {
        return res.status(404).json({
            status: 404,
            success: false,
            error: "Project build not found"
        });
    }

    return res.status(200).json({
        status: 200,
        success: true,
        project,
        build: deployment
    });
}